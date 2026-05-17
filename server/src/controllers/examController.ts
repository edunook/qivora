import { Request, Response } from 'express'
import { Exam } from '../models/Exam'

// @desc    Create a new exam
// @route   POST /api/exams
// @access  Private
export const createExam = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      instructions,
      banner,
      category,
      thumbnail,
      subject,
      isPublic,
      // Scheduling Configuration
      startDate,
      startTime,
      endDate,
      endTime,
      resultsReleaseDate,
      resultsReleaseTime,
      resultsReleased,
      // Security Configuration
      fullscreenMode,
      detectTabSwitching,
      detectMinimizeEvents,
      disableCopy,
      disablePaste,
      disableRightClick,
      autoSubmitOnViolations,
      violationLimit,
      webcamMonitoring,
      suspiciousActivityLogging,
      // Result Configuration
      resultType,
      resultTheme,
      resultColors,
      resultLayoutStyle,
      resultCardStyle,
      resultTypography,
      showRank,
      showPercentage,
      showCorrectAnswers,
      showWrongAnswers,
      showExplanations,
      downloadableResult,
      printableResult,
      leaderboardVisibility,
      // Subjects Array
      subjects,
      // Fallbacks / Legacy Parameters
      questions,
      duration: requestedDuration,
      difficulty,
      negativeMarking,
      negativeMarkValue,
      randomizeQuestions,
      resultsReleaseType,
    } = req.body

    if (!title || !description || !subject) {
      return res.status(400).json({ message: 'Please provide title, description, and subject' })
    }

    // Dynamic computed total duration based on sum of nested subject durations
    let computedDuration = requestedDuration || 30
    if (subjects && subjects.length > 0) {
      computedDuration = subjects.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0)
    }

    const exam = await Exam.create({
      title,
      description,
      instructions: instructions || '',
      banner: banner || '',
      category: category || 'General',
      thumbnail: thumbnail || '',
      subject,
      isPublic: isPublic !== undefined ? isPublic : true,
      creator: (req as any).user.id,
      // Scheduling Configuration
      startDate,
      startTime,
      endDate,
      endTime,
      resultsReleaseDate,
      resultsReleaseTime,
      resultsReleased: resultsReleased !== undefined ? resultsReleased : true,
      // Security Configuration
      fullscreenMode: !!fullscreenMode,
      detectTabSwitching: !!detectTabSwitching,
      detectMinimizeEvents: !!detectMinimizeEvents,
      disableCopy: !!disableCopy,
      disablePaste: !!disablePaste,
      disableRightClick: !!disableRightClick,
      autoSubmitOnViolations: !!autoSubmitOnViolations,
      violationLimit: violationLimit !== undefined ? Number(violationLimit) : 3,
      webcamMonitoring: !!webcamMonitoring,
      suspiciousActivityLogging: !!suspiciousActivityLogging,
      // Result Configuration
      resultType: resultType || 'percentage',
      resultTheme: resultTheme || 'Modern',
      resultColors: resultColors || [],
      resultLayoutStyle: resultLayoutStyle || 'Grid',
      resultCardStyle: resultCardStyle || '',
      resultTypography: resultTypography || '',
      showRank: showRank !== undefined ? !!showRank : true,
      showPercentage: showPercentage !== undefined ? !!showPercentage : true,
      showCorrectAnswers: showCorrectAnswers !== undefined ? !!showCorrectAnswers : true,
      showWrongAnswers: showWrongAnswers !== undefined ? !!showWrongAnswers : true,
      showExplanations: showExplanations !== undefined ? !!showExplanations : true,
      downloadableResult: downloadableResult !== undefined ? !!downloadableResult : true,
      printableResult: printableResult !== undefined ? !!printableResult : true,
      leaderboardVisibility: leaderboardVisibility !== undefined ? !!leaderboardVisibility : true,
      // Subjects Hierarchy
      subjects: subjects || [],
      // Legacy Parameters Fallback
      questions: questions || [],
      duration: computedDuration,
      difficulty: difficulty || 'Intermediate',
      negativeMarking: !!negativeMarking,
      negativeMarkValue: negativeMarkValue !== undefined ? Number(negativeMarkValue) : 0.25,
      randomizeQuestions: !!randomizeQuestions,
      resultsReleaseType: resultsReleaseType || 'immediate',
    })

    res.status(201).json(exam)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Get public exams
// @route   GET /api/exams/public
// @access  Public
export const getPublicExams = async (req: Request, res: Response) => {
  try {
    const { subject } = req.query
    
    // Build filter object
    const filter: any = { isPublic: true }
    
    if (subject && subject !== 'All Subjects') {
      filter.subject = subject
    }

    const exams = await Exam.find(filter)
      .populate('creator', 'name username profilePicture')
      .sort({ createdAt: -1 })

    res.status(200).json(exams)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

// @desc    Get exam by ID
// @route   GET /api/exams/:id
// @access  Public
export const getExamById = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('creator', 'name username profilePicture')
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    res.status(200).json(exam)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}
