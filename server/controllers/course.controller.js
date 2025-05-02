import { current } from "@reduxjs/toolkit";
import { Course } from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteMedia, deleteVideo, uploadMedia } from "../utils/cloudinary.js"

export const createCourse = async (req, res) => {
    try {
        const { courseTitle, category } = req.body
        if (!courseTitle || !category) {
            return res.status(400).json({
                message: "Course title and category are required"
            })
        }

        const course = await Course.create({
            courseTitle,
            category,
            creator: req.id
        })

        return res.status(201).json({
            course,
            message: "Course Created"
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to create Course"
        })
    }
}

export const searchedCourse = async (req, res) => {
    try {
        const { query = "", categories = "", sortByPrice = "" } = req.query
        const categoryArray = categories ? categories.split(",") : []

        const searchCriteria = {
            isPublished: true,
            $or: [
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
            ]
        }

        if (categoryArray.length > 0) {
            searchCriteria.category = { $in: categoryArray }
        }

        const sortOptions = {}
        if (sortByPrice === "low") {
            sortOptions.coursePrice = 1
        }
        else if (sortByPrice === "high") {
            sortOptions.coursePrice = -1
        }
        let courses = await Course.find(searchCriteria).populate({ path: "creator", select: "name photoUrl" }).sort(sortOptions)
        
        return res.status(200).json({
            success: true,
            courses: courses || []
        })
        
    } catch (err) {
        console.log(err);
    }
}

export const getPublishedCourse = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate({ path: "creator", select: "name photoUrl" })
        if (!courses) {
            return res.status(404).json({
                message: "Course not found"
            })
        }
        return res.status(200).json({
            courses,
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to get published courses"
        })
    }
}
export const getCreatorCourses = async (req, res) => {
    try {
        const userId = req.id
        const courses = await Course.find({ creator: userId })
        if (!courses) {
            return res.status(404).json({
                message: "Course not found"
            })
        }
        return res.status(200).json({
            courses
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to create Course"
        })
    }
}

export const editCourse = async (req, res) => {
    try {
        const id = req.params.courseId
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body
        const thumbnail = req.file

        let course = await Course.findById(id)
        if (!course) {
            res.status(404).json({
                message: "Course not found"
            })
        }
        let courseThumbnail
        if (thumbnail) {
            if (course.courseThumbnail) {
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0]
                await deleteMedia(publicId)
            }
            courseThumbnail = await uploadMedia(thumbnail.path)
        }

        const updatedData = { courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail: courseThumbnail?.secure_url }
        course = await Course.findByIdAndUpdate(id, updatedData, { new: true })
        return res.status(200).json({
            course,
            message: "Course updated successfully "
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to create Course"
        })
    }
}

export const getCourseById = async (req, res) => {
    try {
        const id = req.params.courseId
        const course = await Course.findById(id)
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            })
        }

        res.status(200).json({
            course
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to get Course by ID"
        })
    }
}

export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body
        const { courseId } = req.params

        if (!lectureTitle || !courseId) {
            return res.status(400).json({
                message: "Lecture Title is required"
            })
        }

        const lecture = await Lecture.create({ lectureTitle })
        const course = await Course.findById(courseId)
        if (course) {
            course.lectures.push(lecture._id)
            await course.save()
        }
        return res.status(201).json({
            lecture,
            message: "Lecture created successfully"
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to create lecture"
        })
    }
}

export const getCourseLecture = async (req, res) => {
    try {
        const { courseId } = req.params
        const course = await Course.findById(courseId).populate("lectures")
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to get lecture"
        })
    }
}

export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, videoInfo, isPreviewFree } = req.body
        const { courseId, lectureId } = req.params
        const lecture = await Lecture.findById(lectureId)
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found"
            })
        }

        if (lectureTitle) lecture.lectureTitle = lectureTitle
        if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl
        if (videoInfo?.public_id) lecture.public_id = videoInfo.public_id
        lecture.isPreviewFree = isPreviewFree

        await lecture.save()

        const course = await Course.findById(courseId)
        if (course && !course.lectures.includes(lecture._id)) {
            course.lectures.push(lecture._id)
            await course.save()
        }
        return res.status(200).json({
            lecture,
            message: "Lecture updated successfully"
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to Update lecture"
        })
    }
}

export const removeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params
        const lecture = await Lecture.findByIdAndDelete(lectureId)
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found"
            })
        }

        if (lecture.public_id) {
            await deleteVideo(lecture.public_id)
        }

        await Course.updateOne(
            { lectures: lectureId },
            { $pull: { lectures: lectureId } }
        )

        return res.status(200).json({
            message: "Lecture deleted successfully"
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to delete lecture"
        })
    }
}


export const getLectureById = async (req, res) => {
    try {
        const { lectureId } = req.params
        const lecture = await Lecture.findById(lectureId)
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found"
            })
        }

        return res.status(200).json({
            lecture
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to get lecture by ID"
        })
    }
}

export const togglePublicCourse = async (req, res) => {
    try {
        const { courseId } = req.params
        const { publish } = req.query
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            })
        }

        course.isPublished = publish === "true"
        await course.save()
        const statusMessage = course.isPublished ? "Publish" : "unPublish"
        return res.status(200).json({
            message: `Course is ${statusMessage}`
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Failed to Update status"
        })
    }
}