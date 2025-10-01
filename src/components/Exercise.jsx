import { useState, useMemo } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { Flame, Plus, Trash2, Dumbbell, Activity as ActivityIcon, Timer } from 'lucide-react'
import './Exercise.css'

const EXERCISE_TYPES = [
  { name: 'Running', caloriesPerMinute: 10, icon: '🏃' },
  { name: 'Walking', caloriesPerMinute: 4, icon: '🚶' },
  { name: 'Cycling', caloriesPerMinute: 8, icon: '🚴' },
  { name: 'Swimming', caloriesPerMinute: 11, icon: '🏊' },
  { name: 'Gym - Strength', caloriesPerMinute: 6, icon: '💪' },
  { name: 'Gym - Cardio', caloriesPerMinute: 9, icon: '🏋️' },
  { name: 'Yoga', caloriesPerMinute: 3, icon: '🧘' },
  { name: 'Dancing', caloriesPerMinute: 7, icon: '💃' },
  { name: 'Sports', caloriesPerMinute: 8, icon: '⚽' },
  { name: 'Other', caloriesPerMinute: 5, icon: '🎯' }
]

function Exercise({ exercises, addExercise, deleteExercise }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [exerciseType, setExerciseType] = useState('Running')
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [timeRange, setTimeRange] = useState(30)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!exerciseType || !duration) return

    const selectedType = EXERCISE_TYPES.find(t => t.name === exerciseType)
    const caloriesBurned = Math.round(selectedType.caloriesPerMinute * parseInt(duration))

    addExercise({
      type: exerciseType,
      duration: parseInt(duration),
      caloriesBurned,
      notes,
      date: new Date().toISOString()
    })

    setDuration('')
    setNotes('')
  }

  const todayExercises = useMemo(() => {
    const today = startOfDay(new Date())
    return exercises.filter(e =>
      startOfDay(new Date(e.date)).getTime() === today.getTime()
    )
  }, [exercises])

  const todayCaloriesBurned = useMemo(() => {
    return todayExercises.reduce((sum, e) => sum + e.caloriesBurned, 0)
  }, [todayExercises])

  const todayDuration = useMemo(() => {
    return todayExercises.reduce((sum, e) => sum + e.duration, 0)
  }, [todayExercises])

  const historicalData = useMemo(() => {
    const days = []

    if (timeRange === 'all') {
      const allDates = exercises.map(e => startOfDay(new Date(e.date)).getTime())
      const uniqueDates = [...new Set(allDates)].sort((a, b) => a - b)

      uniqueDates.forEach(timestamp => {
        const date = new Date(timestamp)
        const dateStr = date.toDateString()

        const dayExercises = exercises.filter(e =>
          new Date(e.date).toDateString() === dateStr
        )

        days.push({
          date: format(date, 'MMM yyyy'),
          fullDate: format(date, 'MMM d, yyyy'),
          calories: dayExercises.reduce((sum, e) => sum + e.caloriesBurned, 0),
          duration: dayExercises.reduce((sum, e) => sum + e.duration, 0)
        })
      })
    } else {
      const today = startOfDay(new Date())
      for (let i = timeRange - 1; i >= 0; i--) {
        const date = subDays(today, i)
        const dateStr = date.toDateString()

        const dayExercises = exercises.filter(e =>
          new Date(e.date).toDateString() === dateStr
        )

        days.push({
          date: format(date, timeRange >= 365 ? 'MMM yyyy' : 'MMM d'),
          fullDate: format(date, 'MMM d, yyyy'),
          calories: dayExercises.reduce((sum, e) => sum + e.caloriesBurned, 0),
          duration: dayExercises.reduce((sum, e) => sum + e.duration, 0)
        })
      }
    }

    return days
  }, [exercises, timeRange])

  const averageCalories = useMemo(() => {
    if (historicalData.length === 0) return 0
    const total = historicalData.reduce((sum, day) => sum + day.calories, 0)
    return Math.round(total / historicalData.length)
  }, [historicalData])

  const totalCaloriesBurned = useMemo(() => {
    return exercises.reduce((sum, e) => sum + e.caloriesBurned, 0)
  }, [exercises])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.fullDate}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {Math.round(entry.value)}{entry.name === 'Calories' ? ' kcal' : ' min'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const handleDelete = (exerciseId) => {
    deleteExercise(exerciseId)
    setDeleteConfirm(null)
  }

  return (
    <div className="exercise">
      {deleteConfirm && (
        <div className="delete-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Exercise?</h3>
            <p>Are you sure you want to delete this exercise entry?</p>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button className="btn-delete" onClick={() => handleDelete(deleteConfirm)}>
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="exercise-header">
        <div>
          <h2>Exercise Tracker</h2>
          <p className="subtitle">Track your workouts and calories burned</p>
        </div>
      </div>

      <div className="time-range-selector">
        {[7, 14, 30, 90, 180, 365, 'all'].map(range => (
          <button
            key={range}
            className={`range-btn ${timeRange === range ? 'active' : ''}`}
            onClick={() => setTimeRange(range)}
          >
            {range === 'all' ? 'All Time' : range >= 365 ? '1 year' : range >= 180 ? '6 months' : range >= 90 ? '3 months' : `${range} days`}
          </button>
        ))}
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <Flame size={32} />
          <div>
            <span className="stat-label">Today's Burn</span>
            <span className="stat-value">{todayCaloriesBurned} kcal</span>
          </div>
        </div>
        <div className="stat-card">
          <Timer size={32} />
          <div>
            <span className="stat-label">Today's Duration</span>
            <span className="stat-value">{todayDuration} min</span>
          </div>
        </div>
        <div className="stat-card">
          <Dumbbell size={32} />
          <div>
            <span className="stat-label">Average Daily Burn</span>
            <span className="stat-value">{averageCalories} kcal</span>
          </div>
        </div>
        <div className="stat-card">
          <ActivityIcon size={32} />
          <div>
            <span className="stat-label">Total Burned</span>
            <span className="stat-value">{totalCaloriesBurned} kcal</span>
          </div>
        </div>
      </div>

      <div className="exercise-form-section">
        <h3>Log Exercise</h3>
        <form className="exercise-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="exercise-type">Activity Type</label>
              <select
                id="exercise-type"
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                required
              >
                {EXERCISE_TYPES.map(type => (
                  <option key={type.name} value={type.name}>
                    {type.icon} {type.name} (~{type.caloriesPerMinute} kcal/min)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                id="duration"
                type="number"
                min="1"
                placeholder="e.g., 30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
          </div>

          {duration && exerciseType && (
            <div className="calories-preview">
              <Flame size={20} />
              <span>Estimated calories burned: <strong>{Math.round(EXERCISE_TYPES.find(t => t.name === exerciseType).caloriesPerMinute * parseInt(duration || 0))} kcal</strong></span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              placeholder="Add notes about your workout..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
            />
          </div>

          <button type="submit" className="btn-primary btn-large">
            <Plus size={20} />
            Log Exercise
          </button>
        </form>
      </div>

      {historicalData.length > 0 && (
        <div className="chart-section">
          <div className="chart-card full-width">
            <h3>Calories Burned Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="calories"
                  name="Calories"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card full-width">
            <h3>Exercise Duration</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="duration" fill="#6366f1" name="Duration (min)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {exercises.length > 0 && (
        <div className="exercise-history">
          <h3>Recent Activity</h3>
          <div className="exercise-list">
            {exercises
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 20)
              .map((exercise) => {
                const exerciseInfo = EXERCISE_TYPES.find(t => t.name === exercise.type)
                return (
                  <div key={exercise.id} className="exercise-item">
                    <div className="exercise-icon">{exerciseInfo?.icon || '🎯'}</div>
                    <div className="exercise-details">
                      <div className="exercise-header-row">
                        <span className="exercise-type">{exercise.type}</span>
                        <span className="exercise-date">{format(new Date(exercise.date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="exercise-stats-row">
                        <span className="exercise-stat">
                          <Timer size={14} />
                          {exercise.duration} min
                        </span>
                        <span className="exercise-stat">
                          <Flame size={14} />
                          {exercise.caloriesBurned} kcal
                        </span>
                      </div>
                      {exercise.notes && (
                        <p className="exercise-notes">{exercise.notes}</p>
                      )}
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => setDeleteConfirm(exercise.id)}
                      title="Delete exercise"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Exercise