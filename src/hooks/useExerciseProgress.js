import { useState, useCallback, useRef, useEffect } from 'react'

// Custom hook for exercise progress management (following synthesized contract)
export function useExerciseProgress(exerciseId, totalSteps, onComplete) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [stepTimeLeft, setStepTimeLeft] = useState(0)
  // Session data managed through localStorage
  
  const timerRef = useRef(null)
  const startTimeRef = useRef(null)
  const pauseTimeRef = useRef(0)
  const stepStartRef = useRef(null)

  // Complete exercise routine data (structural data only - content comes from translations)
  const routines = {
    posture: {
      id: 'posture',
      name: 'Daily Posture Routine',
      duration: 10,
      description: '10-minute micro-routine to improve alignment',
      exercises: [
        {
          id: 'posture_wall_check',
          duration: 60,
          type: 'activation'
        },
        {
          id: 'posture_chin_tucks',
          duration: 180,
          type: 'strengthening'
        },
        {
          id: 'posture_pull_aparts',
          duration: 180,
          type: 'strengthening'
        },
        {
          id: 'posture_pec_stretch',
          duration: 60,
          type: 'release'
        },
        {
          id: 'posture_cat_camel',
          duration: 120,
          type: 'maintenance'
        }
      ]
    },
    posture_strength: {
      id: 'posture_strength',
      name: 'Strength Session (Optional)',
      duration: 25,
      description: 'Twice-weekly strength add-on to reinforce posture',
      exercises: [
        {
          id: 'foam_roller_thoracic',
          duration: 120,
          type: 'activation'
        },
        {
          id: 'prone_y_raise',
          duration: 180,
          type: 'strengthening'
        },
        {
          id: 'supine_neck_nod',
          duration: 180,
          type: 'strengthening'
        },
        {
          id: 'face_pull_band',
          duration: 180,
          type: 'strengthening'
        },
        {
          id: 'reverse_fly',
          duration: 180,
          type: 'strengthening'
        },
        {
          id: 'dead_bug',
          duration: 180,
          type: 'strength_training'
        }
      ]
    }
  }

  const currentRoutine = routines[exerciseId] || routines.posture
  const currentExercise = currentRoutine.exercises[currentStep] || currentRoutine.exercises[0]

  const nextStep = useCallback(() => {
    const isLastStep = currentStep >= currentRoutine.exercises.length - 1
    
    if (isLastStep) {
      // Session complete
      const completionData = {
        routineId: exerciseId,
        duration: timeElapsed,
        completedAt: new Date().toISOString(),
        steps: currentRoutine.exercises.length
      }
      
      // Save to localStorage
      const existingProgress = JSON.parse(localStorage.getItem('postureCoachProgress') || '[]')
      existingProgress.push(completionData)
      localStorage.setItem('postureCoachProgress', JSON.stringify(existingProgress))
      
      setIsActive(false)
      if (onComplete) {
        onComplete(completionData)
      }
    } else {
      setCurrentStep(prev => prev + 1)
      stepStartRef.current = Date.now()
      if (currentRoutine.exercises[currentStep + 1]?.duration) {
        setStepTimeLeft(currentRoutine.exercises[currentStep + 1].duration)
      }
    }
  }, [currentStep, currentRoutine, exerciseId, timeElapsed, onComplete])

  const updateTimer = useCallback(() => {
    if (!isActive || isPaused) return

    const now = Date.now()
    const totalElapsed = (now - startTimeRef.current - pauseTimeRef.current) / 1000
    setTimeElapsed(Math.floor(totalElapsed))

    if (currentExercise.duration) {
      const stepElapsed = (now - stepStartRef.current) / 1000
      const remaining = Math.max(0, currentExercise.duration - stepElapsed)
      setStepTimeLeft(Math.ceil(remaining))

      if (remaining <= 0) {
        // Auto-advance to next step
        nextStep()
        return
      }
    }

    timerRef.current = setTimeout(updateTimer, 1000)
  }, [isActive, isPaused, currentExercise, nextStep])

  const start = useCallback(() => {
    const now = Date.now()
    
    if (!isActive) {
      startTimeRef.current = now
      stepStartRef.current = now
      pauseTimeRef.current = 0
      setStepTimeLeft(currentExercise.duration || 0)
    } else if (isPaused) {
      pauseTimeRef.current += now - pauseTimeRef.current
      stepStartRef.current = now - (currentExercise.duration - stepTimeLeft) * 1000
    }
    
    setIsActive(true)
    setIsPaused(false)
    updateTimer()
  }, [isActive, isPaused, currentExercise, stepTimeLeft, updateTimer])

  const pause = useCallback(() => {
    if (isActive && !isPaused) {
      setIsPaused(true)
      pauseTimeRef.current = Date.now()
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [isActive, isPaused])

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      stepStartRef.current = Date.now()
      const prevExercise = currentRoutine.exercises[currentStep - 1]
      setStepTimeLeft(prevExercise.duration || 0)
    }
  }, [currentStep, currentRoutine])

  const reset = useCallback(() => {
    setIsActive(false)
    setIsPaused(false)
    setCurrentStep(0)
    setTimeElapsed(0)
    setStepTimeLeft(currentRoutine.exercises[0]?.duration || 0)
    
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
  }, [currentRoutine])

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }, [])

  const getTotalRoutineDuration = useCallback(() => {
    return currentRoutine.exercises.reduce((total, exercise) => total + (exercise.duration || 0), 0)
  }, [currentRoutine])

  const getProgress = useCallback(() => {
    return {
      current: currentStep + 1,
      total: currentRoutine.exercises.length,
      percentage: ((currentStep + 1) / currentRoutine.exercises.length) * 100
    }
  }, [currentStep, currentRoutine])

  return {
    // State
    currentStep,
    currentExercise,
    currentRoutine,
    isActive,
    isPaused,
    timeElapsed,
    stepTimeLeft,
    
    // Controls
    start,
    pause,
    nextStep,
    previousStep,
    reset,
    
    // Helpers
    formatTime,
    getProgress,
    getTotalRoutineDuration,
    
    // Available routines
    routines
  }
}
