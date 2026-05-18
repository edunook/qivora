import { Request, Response } from 'express'
import { ExamResult } from '../models/ExamResult'
import { Exam } from '../models/Exam'

// @desc    Submit exam result
// @route   POST /api/results
// @access  Private
export const submitResult = async (req: Request, res: Response) => {
  try {
    const { examId, answers, timeTaken, cheated, violationsCount, subjectName } = req.body
    const userId = (req as any).user.id

    // Fetch the exam to perform secure server-side grade calculation
    const exam = await Exam.findById(examId)
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    let correct = 0
    let totalQuestions = 0
    let penalty = 0
    const subjectWiseAnalysis: any = {}

    // 1. Process scoring ONLY for the specified subject section if provided
    if (subjectName) {
      const subj = exam.subjects.find((s: any) => s.name === subjectName)
      if (!subj) {
        return res.status(400).json({ message: 'Subject section not found in exam' })
      }

      subj.questions.forEach((q: any, i: number) => {
        totalQuestions++
        const ansKey = String(i)
        const chosenAns = answers[ansKey] !== undefined ? Number(answers[ansKey]) : -1
        const isCorrect = chosenAns === q.correctOption

        const qMarks = q.marks !== undefined ? Number(q.marks) : 1
        
        if (!subjectWiseAnalysis[subjectName]) {
          subjectWiseAnalysis[subjectName] = {
            correct: 0,
            total: 0,
            score: 0,
            maxScore: 0,
            percentage: 0,
            grade: 'F',
            passed: false,
            timeSpent: timeTaken,
          }
        }

        subjectWiseAnalysis[subjectName].total++
        subjectWiseAnalysis[subjectName].maxScore += qMarks

        if (isCorrect) {
          correct++
          subjectWiseAnalysis[subjectName].correct++
          subjectWiseAnalysis[subjectName].score += qMarks
        } else {
          if (exam.negativeMarking) {
            const qPenalty = q.negativeMarks !== undefined ? Number(q.negativeMarks) : (exam.negativeMarkValue || 0.25)
            subjectWiseAnalysis[subjectName].score = Math.max(0, subjectWiseAnalysis[subjectName].score - qPenalty)
            penalty += qPenalty
          }
        }
      })

      const sAnalysis = subjectWiseAnalysis[subjectName]
      sAnalysis.percentage = sAnalysis.maxScore > 0 ? Math.round((sAnalysis.score / sAnalysis.maxScore) * 100) : 0
      const passingThreshold = subj.passingMarks || Math.round(sAnalysis.maxScore * 0.5)
      sAnalysis.passed = sAnalysis.score >= passingThreshold

      let sGrade = 'F'
      if (sAnalysis.percentage >= 90) sGrade = 'A+'
      else if (sAnalysis.percentage >= 80) sGrade = 'A'
      else if (sAnalysis.percentage >= 70) sGrade = 'B'
      else if (sAnalysis.percentage >= 60) sGrade = 'C'
      else if (sAnalysis.percentage >= 50) sGrade = 'D'
      sAnalysis.grade = sGrade
    } else if (exam.subjects && exam.subjects.length > 0) {
      let flatIndex = 0
      exam.subjects.forEach((subj: any) => {
        const subjName = subj.name || 'General'
        if (!subjectWiseAnalysis[subjName]) {
          subjectWiseAnalysis[subjName] = {
            correct: 0,
            total: 0,
            score: 0,
            maxScore: 0,
            percentage: 0,
            grade: 'F',
            passed: false,
            timeSpent: Math.round(timeTaken / exam.subjects.length), // simple split or fallback
          }
        }

        subj.questions.forEach((q: any) => {
          totalQuestions++
          const ansKey = String(flatIndex)
          const chosenAns = answers[ansKey] !== undefined ? Number(answers[ansKey]) : -1
          const isCorrect = chosenAns === q.correctOption

          const qMarks = q.marks !== undefined ? Number(q.marks) : 1
          subjectWiseAnalysis[subjName].total++
          subjectWiseAnalysis[subjName].maxScore += qMarks

          if (isCorrect) {
            correct++
            subjectWiseAnalysis[subjName].correct++
            subjectWiseAnalysis[subjName].score += qMarks
          } else {
            if (exam.negativeMarking) {
              const qPenalty = q.negativeMarks !== undefined ? Number(q.negativeMarks) : (exam.negativeMarkValue || 0.25)
              subjectWiseAnalysis[subjName].score = Math.max(0, subjectWiseAnalysis[subjName].score - qPenalty)
              penalty += qPenalty
            }
          }
          flatIndex++
        })

        // Subject-wise percentage, grades, and pass/fail calculations
        const sAnalysis = subjectWiseAnalysis[subjName]
        sAnalysis.percentage = sAnalysis.maxScore > 0 ? Math.round((sAnalysis.score / sAnalysis.maxScore) * 100) : 0
        
        // Subject-specific passing criteria check
        const passingThreshold = subj.passingMarks || Math.round(sAnalysis.maxScore * 0.5)
        sAnalysis.passed = sAnalysis.score >= passingThreshold

        let sGrade = 'F'
        if (sAnalysis.percentage >= 90) sGrade = 'A+'
        else if (sAnalysis.percentage >= 80) sGrade = 'A'
        else if (sAnalysis.percentage >= 70) sGrade = 'B'
        else if (sAnalysis.percentage >= 60) sGrade = 'C'
        else if (sAnalysis.percentage >= 50) sGrade = 'D'
        sAnalysis.grade = sGrade
      })
    } else {
      // 2. Legacy flat questions fallback
      totalQuestions = exam.questions.length
      exam.questions.forEach((q: any, i: number) => {
        const chosenAns = answers[String(i)] !== undefined ? Number(answers[String(i)]) : -1
        const isCorrect = chosenAns === q.correctOption
        const subj = q.subject || exam.subject || 'General'

        if (!subjectWiseAnalysis[subj]) {
          subjectWiseAnalysis[subj] = {
            correct: 0,
            total: 0,
            score: 0,
            maxScore: 0,
            percentage: 0,
            grade: 'F',
            passed: false,
            timeSpent: timeTaken,
          }
        }

        const qMarks = q.marks !== undefined ? Number(q.marks) : 1
        subjectWiseAnalysis[subj].total++
        subjectWiseAnalysis[subj].maxScore += qMarks

        if (isCorrect) {
          correct++
          subjectWiseAnalysis[subj].correct++
          subjectWiseAnalysis[subj].score += qMarks
        } else {
          if (exam.negativeMarking) {
            const qPenalty = q.negativeMarks !== undefined ? Number(q.negativeMarks) : (exam.negativeMarkValue || 0.25)
            subjectWiseAnalysis[subj].score = Math.max(0, subjectWiseAnalysis[subj].score - qPenalty)
            penalty += qPenalty
          }
        }
      })

      // Calculate legacy section aggregates
      Object.keys(subjectWiseAnalysis).forEach((key) => {
        const subj = subjectWiseAnalysis[key]
        subj.percentage = subj.maxScore > 0 ? Math.round((subj.score / subj.maxScore) * 100) : 0
        subj.passed = subj.percentage >= 50
        
        let sGrade = 'F'
        if (subj.percentage >= 90) sGrade = 'A+'
        else if (subj.percentage >= 80) sGrade = 'A'
        else if (subj.percentage >= 70) sGrade = 'B'
        else if (subj.percentage >= 60) sGrade = 'C'
        else if (subj.percentage >= 50) sGrade = 'D'
        subj.grade = sGrade
      })
    }

    if (totalQuestions === 0) {
      return res.status(400).json({ message: 'Exam has no valid questions' })
    }

    // Cumulative parameters
    const totalMaxPossibleScore = Object.keys(subjectWiseAnalysis).reduce(
      (acc, key) => acc + subjectWiseAnalysis[key].maxScore, 0
    ) || totalQuestions

    const finalScore = Math.max(0, Object.keys(subjectWiseAnalysis).reduce(
      (acc, key) => acc + subjectWiseAnalysis[key].score, 0
    ))
    
    const percentage = totalMaxPossibleScore > 0 ? Math.round((finalScore / totalMaxPossibleScore) * 100) : 0

    // Grade and GPA scale
    let grade = 'F'
    let gpa = 0.0
    if (percentage >= 90) { grade = 'A+'; gpa = 4.0 }
    else if (percentage >= 80) { grade = 'A'; gpa = 3.7 }
    else if (percentage >= 70) { grade = 'B'; gpa = 3.0 }
    else if (percentage >= 60) { grade = 'C'; gpa = 2.0 }
    else if (percentage >= 50) { grade = 'D'; gpa = 1.0 }

    const passed = percentage >= 50

    const result = await ExamResult.create({
      user: userId,
      exam: examId,
      subjectName: subjectName || '',
      answers,
      score: correct,
      totalQuestions,
      percentage,
      timeTaken,
      negativeMarks: penalty,
      finalScore,
      cheated: !!cheated,
      violationsCount: violationsCount || 0,
      grade,
      gpa,
      passed,
      subjectWiseAnalysis,
    })

    // Increment attempt statistics
    await Exam.findByIdAndUpdate(examId, { $inc: { attempts: 1 } })

    res.status(201).json(result)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Get dashboard stats for the logged-in user
// @route   GET /api/results/dashboard
// @access  Private
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id

    const results = await ExamResult.find({ user: userId })
      .populate('exam', 'title subject duration resultsReleaseType resultsReleaseDate resultsReleased')
      .sort({ createdAt: -1 })

    const examsCreated = await Exam.find({ creator: userId }).select('title subject attempts createdAt')
    const examsAttempted = results.length
    
    const releasedResults = results.filter((r: any) => {
      if (!r.exam) return true
      if (r.exam.resultsReleaseType === 'manual') return r.exam.resultsReleased
      if (r.exam.resultsReleaseType === 'scheduled') {
        const releaseDate = new Date(r.exam.resultsReleaseDate)
        if (r.exam.resultsReleaseTime) {
          const [hours, minutes] = r.exam.resultsReleaseTime.split(':')
          releaseDate.setHours(Number(hours) || 0)
          releaseDate.setMinutes(Number(minutes) || 0)
        }
        return new Date() >= releaseDate
      }
      return true
    })

    const avgScore = releasedResults.length > 0
      ? Math.round(releasedResults.reduce((sum, r) => sum + r.percentage, 0) / releasedResults.length * 10) / 10
      : 0
    const totalTimeSec = results.reduce((sum, r) => sum + (r.timeTaken || 0), 0)
    const totalTimeHrs = Math.round(totalTimeSec / 3600 * 10) / 10
    const passed = releasedResults.filter(r => r.percentage >= 50).length

    const recentResults = results.slice(0, 5).map((r: any) => {
      let isReleased = true
      if (r.exam) {
        if (r.exam.resultsReleaseType === 'manual') {
          isReleased = r.exam.resultsReleased
        } else if (r.exam.resultsReleaseType === 'scheduled') {
          const releaseDate = new Date(r.exam.resultsReleaseDate)
          if (r.exam.resultsReleaseTime) {
            const [hours, minutes] = r.exam.resultsReleaseTime.split(':')
            releaseDate.setHours(Number(hours) || 0)
            releaseDate.setMinutes(Number(minutes) || 0)
          }
          isReleased = new Date() >= releaseDate
        }
      }

      return {
        _id: r._id,
        examTitle: r.exam?.title || 'Deleted Exam',
        subject: r.exam?.subject || 'Unknown',
        score: isReleased ? r.score : null,
        totalQuestions: r.totalQuestions,
        percentage: isReleased ? r.percentage : null,
        resultsReleased: isReleased,
        resultsReleaseDate: r.exam?.resultsReleaseDate || null,
        resultsReleaseType: r.exam?.resultsReleaseType || 'immediate',
        createdAt: r.createdAt,
      }
    })

    const chartData = releasedResults.slice(0, 12).reverse().map((r: any) => r.percentage)

    res.status(200).json({
      stats: {
        examsAttempted,
        avgScore,
        totalTimeHrs,
        passed,
        examsCreated: examsCreated.length,
      },
      recentResults,
      chartData,
      myExams: examsCreated,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Get single exam result by ID
// @route   GET /api/results/:id
// @access  Private
export const getResultById = async (req: Request, res: Response) => {
  try {
    const resultId = req.params.id
    const userId = (req as any).user.id

    const result = await ExamResult.findById(resultId)
      .populate({
        path: 'exam',
        populate: { path: 'creator', select: 'name username profilePicture' }
      })
      .populate('user', 'name email username')

    if (!result) {
      return res.status(404).json({ message: 'Exam result not found' })
    }

    if (result.user._id.toString() !== userId && (result.exam as any).creator._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to exam results' })
    }

    const exam = result.exam as any
    let isReleased = true
    let releaseDateStr = ''
    if (exam) {
      if (exam.resultsReleaseType === 'manual') {
        isReleased = exam.resultsReleased
      } else if (exam.resultsReleaseType === 'scheduled') {
        if (exam.resultsReleaseDate) {
          const releaseDate = new Date(exam.resultsReleaseDate)
          if (exam.resultsReleaseTime) {
            const [hours, minutes] = exam.resultsReleaseTime.split(':')
            releaseDate.setHours(Number(hours) || 0)
            releaseDate.setMinutes(Number(minutes) || 0)
          }
          isReleased = new Date() >= releaseDate
          releaseDateStr = releaseDate.toISOString()
        }
      }
    }

    if (!isReleased) {
      return res.status(200).json({
        resultsReleased: false,
        examTitle: exam?.title || 'Unknown Exam',
        subject: exam?.subject || 'Unknown',
        resultsReleaseType: exam?.resultsReleaseType || 'immediate',
        resultsReleaseDate: releaseDateStr || exam?.resultsReleaseDate || null,
        createdAt: result.createdAt,
      })
    }

    res.status(200).json({
      resultsReleased: true,
      result,
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Get user results for a specific exam
// @route   GET /api/results/exam/:examId
// @access  Private
export const getResultsByExam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id
    const { examId } = req.params
    const results = await ExamResult.find({ user: userId, exam: examId })
    res.status(200).json(results)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

