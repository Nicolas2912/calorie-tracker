import { useEffect, useMemo, useState } from 'react'
import { format, startOfDay } from 'date-fns'
import { Flame, TrendingUp, Target, Utensils, Coffee, Moon, Cookie, Pill, Trash2, Activity, Zap, MinusCircle, PlusCircle, X, Save, Wand2 } from 'lucide-react'
import { GOAL_OPTIONS, getPresetValues } from '../constants/goalPresets'
import './Dashboard.css'

function Dashboard({ entries, exercises, achievements, goals, deleteEntry, updateGoals }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isGoalEditorOpen, setGoalEditorOpen] = useState(false)
  const [goalDraft, setGoalDraft] = useState(() => ({
    focus: goals?.focus || 'custom',
    calorieTarget: goals?.calorieTarget || 2000,
    proteinTarget: goals?.proteinTarget || 0,
    netTarget: typeof goals?.netTarget === 'number' ? goals.netTarget : -500
  }))
  const today = startOfDay(new Date())

  useEffect(() => {
    setGoalDraft({
      focus: goals?.focus || 'custom',
      calorieTarget: goals?.calorieTarget || 2000,
      proteinTarget: goals?.proteinTarget || 0,
      netTarget: typeof goals?.netTarget === 'number' ? goals.netTarget : -500
    })
  }, [goals, isGoalEditorOpen])

  const calorieGoal = goals?.calorieTarget || 2000
  const proteinGoal = goals?.proteinTarget || 0
  const netGoal = typeof goals?.netTarget === 'number' ? goals.netTarget : -500

  const todayStats = useMemo(() => {
    const todayEntries = entries.filter(e => {
      const entryDate = startOfDay(new Date(e.date))
      return entryDate.getTime() === today.getTime()
    })

    const stats = {
      total: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0,
      supplements: 0
    }

    todayEntries.forEach(entry => {
      stats.total += entry.calories
      stats.protein += entry.protein
      stats.carbs += entry.carbs
      stats.fat += entry.fat
      stats[entry.mealType] += entry.calories
    })

    return stats
  }, [entries, today])

  const todayExercises = useMemo(() => {
    return exercises.filter(e => {
      const exerciseDate = startOfDay(new Date(e.date))
      return exerciseDate.getTime() === today.getTime()
    })
  }, [exercises, today])

  const caloriesBurned = useMemo(() => {
    return todayExercises.reduce((sum, e) => sum + e.caloriesBurned, 0)
  }, [todayExercises])

  const netCalories = todayStats.total - caloriesBurned
  const adjustedRemaining = calorieGoal - netCalories

  const progress = calorieGoal > 0
    ? Math.min((todayStats.total / calorieGoal) * 100, 100)
    : 0
  const goalCards = []

  const goalFocus = goals?.focus || 'custom'

  const handleGoalFieldChange = (field, value) => {
    setGoalDraft(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFocusChange = (focus) => {
    const presetValues = getPresetValues(focus)
    setGoalDraft(prev => ({
      ...prev,
      focus,
      ...presetValues
    }))
  }

  const saveDraftGoals = (event) => {
    event.preventDefault()
    if (updateGoals) {
      updateGoals({
        focus: goalDraft.focus,
        calorieTarget: Math.max(Number(goalDraft.calorieTarget) || 0, 0),
        proteinTarget: Math.max(Number(goalDraft.proteinTarget) || 0, 0),
        netTarget: Number(goalDraft.netTarget) || 0
      })
    }
    setGoalEditorOpen(false)
  }

  if (calorieGoal > 0) {
    const intakeProgress = Math.min((todayStats.total / calorieGoal) * 100, 100)
    const intakeRemaining = Math.max(calorieGoal - todayStats.total, 0)
    const intakeAchieved = todayStats.total >= calorieGoal
    goalCards.push({
      id: 'calorie',
      label: 'Calorie Intake Goal',
      icon: Flame,
      current: todayStats.total,
      goal: calorieGoal,
      unit: 'kcal',
      progress: intakeProgress,
      achieved: intakeAchieved,
      statusLabel: intakeAchieved
        ? 'Goal met'
        : `${Math.round(intakeRemaining)} kcal remaining`,
      metaLabel: intakeAchieved
        ? Math.round(todayStats.total - calorieGoal) > 0
          ? `${Math.round(todayStats.total - calorieGoal)} kcal over target`
          : 'On target'
        : `${Math.round(intakeRemaining)} kcal to go`
    })
  }

  if (proteinGoal > 0) {
    const proteinProgress = Math.min((todayStats.protein / proteinGoal) * 100, 100)
    const proteinRemaining = Math.max(proteinGoal - todayStats.protein, 0)
    const proteinAchieved = todayStats.protein >= proteinGoal
    goalCards.push({
      id: 'protein',
      label: 'Protein Goal',
      icon: Target,
      current: todayStats.protein,
      goal: proteinGoal,
      unit: 'g',
      progress: proteinProgress,
      achieved: proteinAchieved,
      statusLabel: proteinAchieved
        ? 'Goal met'
        : `${Math.round(proteinRemaining)} g remaining`,
      metaLabel: proteinAchieved
        ? Math.round(todayStats.protein - proteinGoal) > 0
          ? `${Math.round(todayStats.protein - proteinGoal)} g over target`
          : 'On target'
        : `${Math.round(proteinRemaining)} g to go`
    })
  }

  if (typeof netGoal === 'number' && netGoal !== 0) {
    const netGoalMagnitude = Math.abs(netGoal)
    const netProgress = netGoalMagnitude > 0
      ? Math.min((Math.abs(netCalories) / netGoalMagnitude) * 100, 100)
      : 0
    const achieved = netGoal < 0
      ? netCalories <= netGoal
      : netCalories >= netGoal
    const netDifference = netCalories - netGoal
    const netDifferenceAbs = Math.abs(Math.round(netDifference))
    const statusLabel = achieved
      ? 'Goal met'
      : netGoal < 0
        ? `${netDifferenceAbs} kcal more deficit needed`
        : `${netDifferenceAbs} kcal more surplus needed`
    const metaLabel = achieved
      ? netDifferenceAbs > 0
        ? netGoal < 0
          ? `${netDifferenceAbs} kcal deeper deficit than target`
          : `${netDifferenceAbs} kcal beyond target`
        : 'On target'
      : netGoal < 0
        ? `${netDifferenceAbs} kcal to deficit goal`
        : `${netDifferenceAbs} kcal to surplus goal`
    goalCards.push({
      id: 'net',
      label: `${netGoal < 0 ? 'Calorie Deficit Goal' : 'Calorie Surplus Goal'}`,
      icon: TrendingUp,
      current: netCalories,
      goal: netGoal,
      unit: 'kcal',
      progress: netProgress,
      achieved,
      statusLabel,
      metaLabel
    })
  }

  const todayEntries = useMemo(() => {
    return entries
      .filter(e => {
        const entryDate = startOfDay(new Date(e.date))
        return entryDate.getTime() === today.getTime()
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [entries, today])

  const mealIcons = {
    breakfast: Coffee,
    lunch: Utensils,
    dinner: Moon,
    snacks: Cookie,
    supplements: Pill
  }

  const getMealEntries = (mealType) => {
    return todayEntries.filter(e => e.mealType === mealType)
  }

  const handleDelete = (entryId) => {
    deleteEntry(entryId)
    setDeleteConfirm(null)
  }

  return (
    <div className="dashboard">
      {deleteConfirm && (
        <div className="delete-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Entry?</h3>
            <p>Are you sure you want to delete this food entry?</p>
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

      <div className="dashboard-header">
        <h2>Today's Overview</h2>
        <p className="date">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      <div className="calorie-balance-section">
        <div className="balance-card intake">
          <div className="balance-header">
            <PlusCircle size={24} />
            <span>Calories In</span>
          </div>
          <div className="balance-value">{Math.round(todayStats.total)}</div>
          <div className="balance-label">of {Math.round(calorieGoal)} kcal target</div>
        </div>

        <div className="balance-card burned">
          <div className="balance-header">
            <MinusCircle size={24} />
            <span>Calories Out</span>
          </div>
          <div className="balance-value">{Math.round(caloriesBurned)}</div>
          <div className="balance-label">from exercise</div>
        </div>

        <div className={`balance-card net ${netCalories > 0 ? 'positive' : netCalories < 0 ? 'negative' : 'neutral'}`}>
          <div className="balance-header">
            <Zap size={24} />
            <span>Net Balance</span>
          </div>
          <div className="balance-value">
            {netCalories > 0 ? '+' : ''}{Math.round(netCalories)}
          </div>
          <div className="balance-label">
            {netCalories > 0 ? 'calorie surplus' : netCalories < 0 ? 'calorie deficit' : 'balanced'}
          </div>
        </div>
      </div>

      <div className="key-metrics-grid">
        <div className="stat-card primary key-metric">
          <div className="stat-icon">
            <Flame size={32} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Calories Consumed</span>
            <span className="stat-value">{Math.round(todayStats.total)}</span>
            <span className="stat-sublabel">of {Math.round(calorieGoal)} kcal goal</span>
          </div>
        </div>

        <div className="stat-card key-metric">
          <div className="stat-icon secondary">
            <Activity size={32} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Calories Burned</span>
            <span className="stat-value">{Math.round(caloriesBurned)}</span>
            <span className="stat-sublabel">{todayExercises.length} workout{todayExercises.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="stat-card key-metric">
          <div className="stat-icon highlight">
            <Target size={32} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Adjusted Remaining</span>
            <span className="stat-value">{Math.round(adjustedRemaining)}</span>
            <span className="stat-sublabel">with exercise</span>
          </div>
        </div>
      </div>

      {goalCards.length > 0 && (
        <div className="goals-section">
          <div className="goals-section-header">
            <div className="goals-section-title">
              <h3>Goal Progress</h3>
              <span className="goal-focus-pill">
                Focus: {GOAL_OPTIONS.find(option => option.value === goalFocus)?.label || 'Custom'}
              </span>
            </div>
            <button className="goal-edit-btn" onClick={() => setGoalEditorOpen(true)}>
              <Wand2 size={18} />
              Edit goals
            </button>
          </div>
          <div className="goal-cards">
            {goalCards.map(card => {
              const Icon = card.icon
              const goalMet = card.achieved
              const targetDisplay = `${card.goal > 0 ? '+' : card.goal < 0 ? '-' : ''}${Math.abs(Math.round(card.goal))}`

              return (
                <div key={card.id} className={`goal-card ${goalMet ? 'completed' : ''}`}>
                  <div className="goal-card-header">
                    <div className="goal-card-icon">
                      <Icon size={24} />
                    </div>
                    <div>
                      <span className="goal-card-label">{card.label}</span>
                      <span className="goal-card-target">Target: {targetDisplay} {card.unit}</span>
                    </div>
                  </div>
                  <div className="goal-card-values">
                    <span className="goal-current">
                      {card.id === 'net' && card.current > 0 ? '+' : ''}{Math.round(card.current)} {card.unit}
                    </span>
                    <span className={`goal-status ${goalMet ? 'met' : ''}`}>
                      {card.statusLabel}
                    </span>
                  </div>
                  <div className="goal-progress-bar">
                    <div
                      className="goal-progress-fill"
                      style={{ width: `${Math.min(card.progress, 100)}%` }}
                    />
                  </div>
                  <div className="goal-progress-meta">
                    <span>{Math.round(Math.min(card.progress, 100))}% of target</span>
                    {card.metaLabel && (
                      <span className="goal-remaining">{card.metaLabel}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="macro-grid">
        <div className="macro-card">
          <span className="macro-label">Protein</span>
          <span className="macro-value">{Math.round(todayStats.protein)}g</span>
        </div>

        <div className="macro-card">
          <span className="macro-label">Carbs</span>
          <span className="macro-value">{Math.round(todayStats.carbs)}g</span>
        </div>

        <div className="macro-card">
          <span className="macro-label">Fat</span>
          <span className="macro-value">{Math.round(todayStats.fat)}g</span>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>Daily Goal Progress</span>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              background: progress >= 100
                ? 'linear-gradient(90deg, var(--secondary) 0%, var(--primary) 100%)'
                : 'linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%)'
            }}
          />
        </div>
      </div>

      <div className="meals-detailed">
        <h3>Today's Meals</h3>
        {Object.entries(mealIcons).map(([meal, Icon]) => {
          const mealEntries = getMealEntries(meal)
          return (
            <div key={meal} className="meal-section">
              <div className="meal-section-header">
                <div className="meal-section-title">
                  <div className="meal-section-icon">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4>{meal.charAt(0).toUpperCase() + meal.slice(1)}</h4>
                    <span className="meal-section-calories">
                      {Math.round(todayStats[meal])} kcal
                    </span>
                  </div>
                </div>
                <span className="meal-section-count">
                  {mealEntries.length} {mealEntries.length === 1 ? 'item' : 'items'}
                </span>
              </div>

              {mealEntries.length > 0 ? (
                <div className="meal-section-entries">
                  {mealEntries.map((entry, index) => (
                    <div key={index} className="meal-entry-item">
                      <div className="meal-entry-main">
                        <span className="meal-entry-name">{entry.foodName}</span>
                        <span className="meal-entry-amount">
                          {entry.amount}{entry.unit}
                        </span>
                      </div>
                      <div className="meal-entry-nutrition">
                        <span className="meal-entry-cal">
                          <Flame size={14} />
                          {Math.round(entry.calories)} cal
                        </span>
                        <span className="meal-entry-macro">P: {Math.round(entry.protein)}g</span>
                        <span className="meal-entry-macro">C: {Math.round(entry.carbs)}g</span>
                        <span className="meal-entry-macro">F: {Math.round(entry.fat)}g</span>
                      </div>
                      <div className="meal-entry-actions">
                        <span className="meal-entry-time">
                          {format(new Date(entry.date), 'HH:mm')}
                        </span>
                        <button
                          className="delete-btn"
                          onClick={() => setDeleteConfirm(entry.id)}
                          title="Delete entry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="meal-section-empty">
                  No {meal} tracked yet
                </div>
              )}
            </div>
          )
        })}
      </div>

      {achievements && (
        <div className="quick-achievements">
          <div className="achievement-item">
            <TrendingUp size={20} />
            <span>Level {achievements.level}</span>
          </div>
          <div className="achievement-item">
            <Flame size={20} />
            <span>{achievements.streak} day streak</span>
          </div>
        </div>
      )}

      {isGoalEditorOpen && (
        <div className="goal-editor-overlay" onClick={() => setGoalEditorOpen(false)}>
          <div className="goal-editor" onClick={(e) => e.stopPropagation()}>
            <div className="goal-editor-header">
              <div>
                <h3>Tune Your Goals</h3>
                <p>Pick a focus or dial in the exact numbers you need today.</p>
              </div>
              <button className="goal-editor-close" onClick={() => setGoalEditorOpen(false)}>
                <X size={22} />
              </button>
            </div>

            <form className="goal-editor-form" onSubmit={saveDraftGoals}>
              <div className="goal-editor-focus">
                <label htmlFor="goal-focus">Focus</label>
                <select
                  id="goal-focus"
                  value={goalDraft.focus}
                  onChange={(e) => handleFocusChange(e.target.value)}
                >
                  {GOAL_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="goal-focus-description">
                  {GOAL_OPTIONS.find(option => option.value === goalDraft.focus)?.description}
                </span>
              </div>

              <div className="goal-editor-grid">
                <label className="goal-editor-field">
                  <span>Daily calories</span>
                  <div className="goal-editor-input">
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={goalDraft.calorieTarget}
                      onChange={(e) => handleGoalFieldChange('calorieTarget', e.target.value)}
                    />
                    <span className="unit">kcal</span>
                  </div>
                </label>

                <label className="goal-editor-field">
                  <span>Daily protein</span>
                  <div className="goal-editor-input">
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={goalDraft.proteinTarget}
                      onChange={(e) => handleGoalFieldChange('proteinTarget', e.target.value)}
                    />
                    <span className="unit">g</span>
                  </div>
                </label>

                <label className="goal-editor-field">
                  <span>Net calories</span>
                  <div className="goal-editor-input">
                    <input
                      type="number"
                      step="10"
                      value={goalDraft.netTarget}
                      onChange={(e) => handleGoalFieldChange('netTarget', e.target.value)}
                    />
                    <span className="unit">kcal</span>
                  </div>
                  <span className="field-help">Negative for deficit, positive for surplus.</span>
                </label>
              </div>

              <div className="goal-editor-actions">
                <button type="button" className="goal-editor-cancel" onClick={() => setGoalEditorOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="goal-editor-save">
                  <Save size={18} />
                  Save goals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
