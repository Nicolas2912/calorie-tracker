import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfDay, differenceInDays } from 'date-fns'
import { Activity, Plus, TrendingDown, TrendingUp, Trash2, Target, Award, Zap } from 'lucide-react'
import './KFATracker.css'

function KFATracker({ kfaHistory, addKFA, deleteKFA }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [kfaValue, setKfaValue] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')
  const [timeRange, setTimeRange] = useState(90) // days or 'all'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!kfaValue || !weight) return

    addKFA({
      kfa: parseFloat(kfaValue),
      weight: parseFloat(weight),
      notes,
      date: new Date().toISOString()
    })

    setKfaValue('')
    setWeight('')
    setNotes('')
  }

  const chartData = useMemo(() => {
    let filteredHistory = kfaHistory.slice()

    // Filter by time range
    if (timeRange !== 'all') {
      const cutoffDate = subDays(startOfDay(new Date()), timeRange)
      filteredHistory = filteredHistory.filter(entry =>
        new Date(entry.date) >= cutoffDate
      )
    }

    return filteredHistory
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(entry => ({
        date: format(new Date(entry.date), timeRange === 'all' || timeRange >= 365 ? 'MMM yyyy' : 'MMM d'),
        fullDate: format(new Date(entry.date), 'MMM d, yyyy'),
        kfa: entry.kfa,
        weight: entry.weight
      }))
  }, [kfaHistory, timeRange])

  const latestEntry = kfaHistory.length > 0
    ? kfaHistory.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[0]
    : null

  const previousEntry = kfaHistory.length > 1
    ? kfaHistory.slice().sort((a, b) => new Date(b.date) - new Date(a.date))[1]
    : null

  const kfaChange = latestEntry && previousEntry
    ? latestEntry.kfa - previousEntry.kfa
    : 0

  const weightChange = latestEntry && previousEntry
    ? latestEntry.weight - previousEntry.weight
    : 0

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.fullDate}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === 'KFA' ? '%' : 'kg'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const handleDelete = (kfaId) => {
    deleteKFA(kfaId)
    setDeleteConfirm(null)
  }

  // Motivational stats
  const progressStats = useMemo(() => {
    if (kfaHistory.length < 2) return null

    const sorted = kfaHistory.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
    const first = sorted[0]
    const latest = sorted[sorted.length - 1]

    const totalKFALost = first.kfa - latest.kfa
    const totalFatLost = (first.weight * first.kfa / 100) - (latest.weight * latest.kfa / 100)
    const leanMassGained = (latest.weight * (1 - latest.kfa / 100)) - (first.weight * (1 - first.kfa / 100))
    const daysSinceStart = differenceInDays(new Date(latest.date), new Date(first.date))

    return {
      totalKFALost,
      totalFatLost,
      leanMassGained,
      daysSinceStart,
      startDate: format(new Date(first.date), 'MMM d, yyyy')
    }
  }, [kfaHistory])

  const getMotivationalMessage = () => {
    if (!latestEntry) return null
    if (!previousEntry) return "Start your journey! Track your progress consistently."

    if (kfaChange < 0) {
      return "Amazing work! You're making great progress! 🎉"
    } else if (kfaChange > 0) {
      return "Don't give up! Small setbacks are part of the journey. 💪"
    } else {
      return "Stay consistent! Results take time. 🔥"
    }
  }

  const getGoalProgress = () => {
    if (!latestEntry || !progressStats) return null

    const current = latestEntry.kfa
    const milestones = [20, 18, 15, 12, 10, 8]
    const nextGoal = milestones.find(m => m < current)

    if (!nextGoal) return null

    const progress = ((current - nextGoal) / current) * 100

    return {
      nextGoal,
      progress: 100 - progress,
      remaining: (current - nextGoal).toFixed(1)
    }
  }

  const goalProgress = getGoalProgress()

  return (
    <div className="kfa-tracker">
      {deleteConfirm && (
        <div className="delete-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete KFA Entry?</h3>
            <p>Are you sure you want to delete this body composition measurement?</p>
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
      <div className="kfa-header">
        <div className="kfa-title">
          <h2>Body Fat Percentage Tracker</h2>
          <p className="subtitle">Monitor your body composition over time</p>
        </div>
        <div className="time-range-selector">
          {[30, 90, 180, 365, 'all'].map(range => (
            <button
              key={range}
              className={`range-btn ${timeRange === range ? 'active' : ''}`}
              onClick={() => setTimeRange(range)}
            >
              {range === 'all' ? 'All Time' : range >= 365 ? '1 year' : range >= 180 ? '6 months' : range >= 90 ? '3 months' : `${range} days`}
            </button>
          ))}
        </div>
      </div>

      {getMotivationalMessage() && (
        <div className="motivation-banner">
          <Zap size={24} />
          <p>{getMotivationalMessage()}</p>
        </div>
      )}

      {goalProgress && (
        <div className="goal-progress-card">
          <div className="goal-header">
            <Target size={32} />
            <div>
              <h3>Next Milestone: {goalProgress.nextGoal}% Body Fat</h3>
              <p>You're {goalProgress.remaining}% away from your next goal!</p>
            </div>
          </div>
          <div className="goal-progress-bar">
            <div
              className="goal-progress-fill"
              style={{ width: `${goalProgress.progress}%` }}
            />
          </div>
          <span className="goal-percentage">{goalProgress.progress.toFixed(1)}% Complete</span>
        </div>
      )}

      {progressStats && (
        <div className="progress-achievements">
          <h3>
            <Award size={24} />
            Your Journey Since {progressStats.startDate}
          </h3>
          <div className="achievement-grid">
            <div className="achievement-card">
              <TrendingDown size={28} />
              <div>
                <span className="achievement-value">{progressStats.totalKFALost.toFixed(1)}%</span>
                <span className="achievement-label">Body Fat Lost</span>
              </div>
            </div>
            <div className="achievement-card">
              <Activity size={28} />
              <div>
                <span className="achievement-value">{Math.abs(progressStats.totalFatLost).toFixed(1)} kg</span>
                <span className="achievement-label">Fat Mass Lost</span>
              </div>
            </div>
            <div className="achievement-card">
              <TrendingUp size={28} />
              <div>
                <span className="achievement-value">{progressStats.leanMassGained.toFixed(1)} kg</span>
                <span className="achievement-label">Lean Mass {progressStats.leanMassGained >= 0 ? 'Gained' : 'Lost'}</span>
              </div>
            </div>
            <div className="achievement-card">
              <Target size={28} />
              <div>
                <span className="achievement-value">{progressStats.daysSinceStart}</span>
                <span className="achievement-label">Days of Progress</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="kfa-form-section">
        <form className="kfa-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="kfa">KFA (%)</label>
              <input
                id="kfa"
                type="number"
                step="0.1"
                placeholder="e.g., 15.5"
                value={kfaValue}
                onChange={(e) => setKfaValue(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="weight">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                step="0.1"
                placeholder="e.g., 75.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              placeholder="Add any notes about your measurement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
            />
          </div>

          <button type="submit" className="btn-primary btn-large">
            <Plus size={20} />
            Add Entry
          </button>
        </form>
      </div>

      {latestEntry && (
        <div className="current-stats">
          <div className="stat-box">
            <Activity size={32} />
            <div className="stat-content">
              <span className="stat-label">Current KFA</span>
              <span className="stat-value">{latestEntry.kfa}%</span>
              {kfaChange !== 0 && (
                <span className={`stat-change ${kfaChange < 0 ? 'positive' : 'negative'}`}>
                  {kfaChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(kfaChange).toFixed(1)}% from last
                </span>
              )}
            </div>
          </div>

          <div className="stat-box">
            <Activity size={32} />
            <div className="stat-content">
              <span className="stat-label">Current Weight</span>
              <span className="stat-value">{latestEntry.weight} kg</span>
              {weightChange !== 0 && (
                <span className={`stat-change ${weightChange < 0 ? 'positive' : 'negative'}`}>
                  {weightChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(weightChange).toFixed(1)}kg from last
                </span>
              )}
            </div>
          </div>

          {latestEntry.kfa && latestEntry.weight && (
            <>
              <div className="stat-box">
                <div className="stat-content">
                  <span className="stat-label">Fat Mass</span>
                  <span className="stat-value">
                    {(latestEntry.weight * latestEntry.kfa / 100).toFixed(1)} kg
                  </span>
                </div>
              </div>

              <div className="stat-box">
                <div className="stat-content">
                  <span className="stat-label">Lean Mass</span>
                  <span className="stat-value">
                    {(latestEntry.weight * (1 - latestEntry.kfa / 100)).toFixed(1)} kg
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {chartData.length > 0 && (
        <div className="chart-section">
          <div className="chart-card">
            <h3>KFA Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="kfa"
                  name="KFA"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Weight Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Weight"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {kfaHistory.length > 0 && (
        <div className="history-section">
          <h3>History</h3>
          <div className="history-list">
            {kfaHistory
              .slice()
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-item-header">
                    <div className="history-date">
                      {format(new Date(entry.date), 'MMM d, yyyy')}
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => setDeleteConfirm(entry.id)}
                      title="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="history-stats">
                    <span className="history-stat">
                      <strong>KFA:</strong> {entry.kfa}%
                    </span>
                    <span className="history-stat">
                      <strong>Weight:</strong> {entry.weight}kg
                    </span>
                  </div>
                  {entry.notes && (
                    <div className="history-notes">{entry.notes}</div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default KFATracker