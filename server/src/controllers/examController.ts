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

// @desc    Update an existing exam
// @route   PUT /api/exams/:id
// @access  Private
export const updateExam = async (req: Request, res: Response) => {
  try {
    const exam = await Exam.findById(req.params.id)
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' })
    }

    // Verify ownership
    if (exam.creator.toString() !== (req as any).user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this exam' })
    }

    const {
      title,
      description,
      instructions,
      banner,
      category,
      thumbnail,
      subject,
      isPublic,
      startDate,
      startTime,
      endDate,
      endTime,
      resultsReleaseDate,
      resultsReleaseTime,
      resultsReleased,
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
      resultType,
      resultTheme,
      resultColors,
      resultLayoutStyle,
      showRank,
      showPercentage,
      showCorrectAnswers,
      showWrongAnswers,
      showExplanations,
      downloadableResult,
      printableResult,
      leaderboardVisibility,
      subjects,
      questions,
      duration,
      difficulty,
      negativeMarking,
      negativeMarkValue,
      randomizeQuestions,
      resultsReleaseType,
    } = req.body

    // Recompute total duration if subjects array has changed
    let computedDuration = duration || exam.duration
    if (subjects && subjects.length > 0) {
      computedDuration = subjects.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0)
    }

    // Update fields
    if (title !== undefined) exam.title = title
    if (description !== undefined) exam.description = description
    if (instructions !== undefined) exam.instructions = instructions
    if (banner !== undefined) exam.banner = banner
    if (category !== undefined) exam.category = category
    if (thumbnail !== undefined) exam.thumbnail = thumbnail
    if (subject !== undefined) exam.subject = subject
    if (isPublic !== undefined) exam.isPublic = !!isPublic

    // Scheduling
    if (startDate !== undefined) exam.startDate = startDate
    if (startTime !== undefined) exam.startTime = startTime
    if (endDate !== undefined) exam.endDate = endDate
    if (endTime !== undefined) exam.endTime = endTime
    if (resultsReleaseDate !== undefined) exam.resultsReleaseDate = resultsReleaseDate
    if (resultsReleaseTime !== undefined) exam.resultsReleaseTime = resultsReleaseTime
    if (resultsReleased !== undefined) exam.resultsReleased = !!resultsReleased

    // Security
    if (fullscreenMode !== undefined) exam.fullscreenMode = !!fullscreenMode
    if (detectTabSwitching !== undefined) exam.detectTabSwitching = !!detectTabSwitching
    if (detectMinimizeEvents !== undefined) exam.detectMinimizeEvents = !!detectMinimizeEvents
    if (disableCopy !== undefined) exam.disableCopy = !!disableCopy
    if (disablePaste !== undefined) exam.disablePaste = !!disablePaste
    if (disableRightClick !== undefined) exam.disableRightClick = !!disableRightClick
    if (autoSubmitOnViolations !== undefined) exam.autoSubmitOnViolations = !!autoSubmitOnViolations
    if (violationLimit !== undefined) exam.violationLimit = Number(violationLimit)
    if (webcamMonitoring !== undefined) exam.webcamMonitoring = !!webcamMonitoring
    if (suspiciousActivityLogging !== undefined) exam.suspiciousActivityLogging = !!suspiciousActivityLogging

    // Result Design
    if (resultType !== undefined) exam.resultType = resultType
    if (resultTheme !== undefined) exam.resultTheme = resultTheme
    if (resultColors !== undefined) exam.resultColors = resultColors
    if (resultLayoutStyle !== undefined) exam.resultLayoutStyle = resultLayoutStyle
    if (showRank !== undefined) exam.showRank = !!showRank
    if (showPercentage !== undefined) exam.showPercentage = !!showPercentage
    if (showCorrectAnswers !== undefined) exam.showCorrectAnswers = !!showCorrectAnswers
    if (showWrongAnswers !== undefined) exam.showWrongAnswers = !!showWrongAnswers
    if (showExplanations !== undefined) exam.showExplanations = !!showExplanations
    if (downloadableResult !== undefined) exam.downloadableResult = !!downloadableResult
    if (printableResult !== undefined) exam.printableResult = !!printableResult
    if (leaderboardVisibility !== undefined) exam.leaderboardVisibility = !!leaderboardVisibility

    // Subjects and Questions hierarchy
    if (subjects !== undefined) exam.subjects = subjects
    if (questions !== undefined) exam.questions = questions
    exam.duration = computedDuration
    if (difficulty !== undefined) exam.difficulty = difficulty
    if (negativeMarking !== undefined) exam.negativeMarking = !!negativeMarking
    if (negativeMarkValue !== undefined) exam.negativeMarkValue = Number(negativeMarkValue)
    if (randomizeQuestions !== undefined) exam.randomizeQuestions = !!randomizeQuestions
    if (resultsReleaseType !== undefined) exam.resultsReleaseType = resultsReleaseType

    const updatedExam = await exam.save()
    res.status(200).json(updatedExam)
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server Error' })
  }
}

