import Stripe from 'stripe'
import { Course } from '../models/course.model.js'
import { CoursePurchase } from '../models/purchaseCourse.model.js'
import { Lecture } from '../models/lecture.model.js'
import { User } from '../models/user.model.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id
    const { courseId } = req.body

    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      })
    }

    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: 'pending'
    })

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100, // Amount in paise (lowest denomination)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/course-progress/${courseId}`, // once payment successful redirect to course progress page
      cancel_url: `${process.env.FRONTEND_URL}/course-detail/${courseId}`,
      metadata: {
        courseId: courseId,
        userId: userId,
      },
      shipping_address_collection: {
        allowed_countries: ["IN"], // Optionally restrict allowed countries
      },
    });

    if (!session.url) {
      return res
        .status(400)
        .json({ success: false, message: "Error while creating session" });
    }

    // Save the purchase record
    newPurchase.paymentId = session.id;
    await newPurchase.save();

    return res.status(200).json({
      success: true,
      url: session.url, // Return the Stripe checkout URL
    });
  } catch (err) {
    console.log(err);

  }
}
export const stripeWebhook = async (req, res) => {
  let event;

  try {
    // Retrieve the Stripe signature header and the raw body of the request
    const sig = req.headers['stripe-signature'];
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET; // Your Stripe webhook secret

    // Construct the event from the raw body and the Stripe signature
    event = stripe.webhooks.constructEvent(req.rawBody, sig, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("Checkout session completed");

    try {
      const session = event.data.object; // Contains the session object

      console.log('Session Data:', session);
      // Find the purchase record using the session ID
      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });
      console.log('Purchase Data:', purchase);

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      // Update the purchase status to 'completed' if payment is successful
      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update the user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
        { new: true }
      );

      // Update the course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
        { new: true }
      );
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Respond to Stripe that the webhook was received successfully
  res.status(200).send();
};


export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.id

    const course = await Course.findById(courseId).populate({ path: "creator" }).populate({ path: "lectures" })
    const purchased = await CoursePurchase.findOne({ userId, courseId })

    if (!course) {
      return res.status(404).json({
        message: "Course not found"
      })
    }
    return res.status(200).json({
      course,
      purchased: !!purchased
    })
  } catch (err) {
    console.log(err);
  }
}

export const GetAllPurchasedCourse = async (req, res) => {
  try {
    const instructorId = req.id;

    // Find all courses created by the instructor
    const instructorCourses = await Course.find({ creator: instructorId }).select('_id');

    const courseIds = instructorCourses.map(course => course._id);

    // Find purchases only for those courses
    const purchasedCourses = await CoursePurchase.find({
      status: "completed",
      courseId: { $in: courseIds }
    }).populate("courseId");

    return res.status(200).json({
      purchasedCourses,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Failed to fetch purchased courses",
      purchasedCourses: []
    });
  }
};
