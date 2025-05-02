import { CourseProgess } from "../models/courseProgress.model.js";
import { Course } from "../models/course.model.js"

export const getCourseProgress = async (req, res) => {
    try {
        const { courseId } = req.params
        const userId = req.id

        let courseProgress = await CourseProgess.findOne({ courseId, userId }).populate("courseId")
        const courseDetails = await Course.findById(courseId).populate("lectures")

        if (!courseDetails) {
            return res.status(404).json({
                message: "Course not found"
            })
        }

        if (!courseProgress) {
            return res.status(200).json({
                data: {
                    courseDetails,
                    progress: [],
                    completed: false
                }
            })
        }

        return res.status(200).json({
            data: {
                courseDetails,
                progress: courseProgress.lectureProgress,
                completed: courseProgress.completed
            }
        })
    } catch (err) {
        console.log(err);
    }
}

export const updateLectureProgress = async (req, res) => {
    try {
        const { courseId, lectureId } = req.params
        const userId = req.id

        let courseProgress = await CourseProgess.findOne({ courseId, userId })
        if (!courseProgress) {

            courseProgress = new CourseProgess({
                userId,
                courseId,
                completed: false,
                lectureProgress: []
            })
        }

        const lectureIndex = courseProgress.lectureProgress.findIndex((lecture) => lecture.lectureId === lectureId)

        if (lectureIndex !== -1) {
            courseProgress.lectureProgress[lectureIndex].viewed = true
        } else {
            courseProgress.lectureProgress.push({
                lectureId,
                viewed: true
            })
        }

        const lectureProgressLength = courseProgress.lectureProgress.filter((lectureProg) => lectureProg.viewed).length
        const course = await Course.findById(courseId)

        if (course.lectures.length === lectureProgressLength) courseProgress.completed = true

        await courseProgress.save()
        return res.status(200).json({
            message: "Lecture Progress updates successfully"
        })
    } catch (err) {
        console.log(err);
    }
}

export const markAsCompleted = async (req, res) => {
    try {
        const { courseId } = req.params
        const userId = req.id

        const courseProgress = await CourseProgess.findOne({ courseId, userId })
        if (!courseProgress) return res.status(404).json({ message: "Course Progress not found" })

        courseProgress.lectureProgress.map((lectureProgress) => lectureProgress.viewed = true)
        courseProgress.completed = true
        await courseProgress.save()
        return res.status(200).json({
            message: "Course marked as completed"
        })
    } catch (err) {
        console.log(err);
    }
}

export const markAsInCompleted = async (req, res) => {
    try {
        const { courseId } = req.params
        const userId = req.id

        const courseProgress = await CourseProgess.findOne({ courseId, userId })
        if (!courseProgress) return res.status(404).json({ message: "Course Progress not found" })

        courseProgress.lectureProgress.map((lectureProgress) => lectureProgress.viewed = false)
        courseProgress.completed = false
        await courseProgress.save()
        return res.status(200).json({
            message: "Course marked as incompleted"
        })
    } catch (err) {
        console.log(err);
    }
}