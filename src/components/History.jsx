import { useState, useMemo } from 'react'
import { format, startOfDay, subDays, addDays, startOfMonth, endOfMonth, startOfYear, endOfYear, addMonths, subMonths, addYears, subYears, startOfWeek, endOfWeek, subWeeks, addWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, Calendar, Flame, Coffee, Utensils, Moon, Cookie, Pill, Trash2, ChevronsLeft, ChevronsRight, ChevronDown, ChevronUp, Search, X, BarChart3, TrendingUp } from 'lucide-react'
import './History.css'

function History({ entries, deleteEntry }) {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()))
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [viewMode, setViewMode] = useState('day') // 'day', 'week', 'month', 'year', 'all'
  const [collapsedMeals, setCollapsedMeals] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')


  // Get statistics for the entire history
  const historyStats = useMemo(() => {
    if (entries.length === 0) return null

    const dates = entries.map(e => new Date(e.date))
    const oldestDate = new Date(Math.min(...dates))
    const newestDate = new Date(Math.max(...dates))

    const uniqueDays = new Set(entries.map(e => startOfDay(new Date(e.date)).getTime())).size
    const totalEntries = entries.length

    return {
      oldestDate,
      newestDate,
      uniqueDays,
      totalEntries
    }
  }, [entries])

  // Get entries for current view period
  const periodEntries = useMemo(() => {
    let startDate, endDate
    const now = new Date()
    
    switch (viewMode) {
      case 'day':
        startDate = startOfDay(selectedDate)
        endDate = startOfDay(selectedDate)
        break
      case 'week':
        startDate = startOfWeek(selectedDate, { weekStartsOn: 1 }) // Monday start
        endDate = endOfWeek(selectedDate, { weekStartsOn: 1 })
        break
      case 'month':
        startDate = startOfMonth(selectedDate)
        endDate = endOfMonth(selectedDate)
        break
      case 'year':
        startDate = startOfYear(selectedDate)
        endDate = endOfYear(selectedDate)
        break
      case 'all':
        return entries.filter(e => 
          searchTerm === '' || e.foodName.toLowerCase().includes(searchTerm.toLowerCase())
        ).sort((a, b) => new Date(b.date) - new Date(a.date))
      default:
        startDate = startOfDay(selectedDate)
        endDate = startOfDay(selectedDate)
    }

    return entries
      .filter(e => {
        const entryDate = startOfDay(new Date(e.date))
        const matchesDate = entryDate >= startDate && entryDate <= endDate
        const matchesSearch = searchTerm === '' || e.foodName.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesDate && matchesSearch
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [entries, selectedDate, searchTerm, viewMode])

  const selectedDateEntries = periodEntries

  const periodStats = useMemo(() => {
    const stats = {
      total: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0,
      supplements: 0,
      totalEntries: selectedDateEntries.length,
      uniqueDays: 0,
      avgCaloriesPerDay: 0,
      avgProteinPerDay: 0
    }

    // Calculate unique days in the period
    const uniqueDayTimestamps = new Set(
      selectedDateEntries.map(e => startOfDay(new Date(e.date)).getTime())
    )
    stats.uniqueDays = uniqueDayTimestamps.size

    selectedDateEntries.forEach(entry => {
      stats.total += entry.calories
      stats.protein += entry.protein
      stats.carbs += entry.carbs
      stats.fat += entry.fat
      stats[entry.mealType] += entry.calories
    })

    // Calculate averages per day
    if (stats.uniqueDays > 0) {
      stats.avgCaloriesPerDay = stats.total / stats.uniqueDays
      stats.avgProteinPerDay = stats.protein / stats.uniqueDays
    }

    return stats
  }, [selectedDateEntries])

  const dateStats = periodStats

  const mealIcons = {
    breakfast: Coffee,
    lunch: Utensils,
    dinner: Moon,
    snacks: Cookie,
    supplements: Pill
  }

  const getMealEntries = (mealType) => {
    return selectedDateEntries.filter(e => e.mealType === mealType)
  }

  const goToPreviousPeriod = () => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(subDays(selectedDate, 1))
        break
      case 'week':
        setSelectedDate(subWeeks(selectedDate, 1))
        break
      case 'month':
        setSelectedDate(subMonths(selectedDate, 1))
        break
      case 'year':
        setSelectedDate(subYears(selectedDate, 1))
        break
      case 'all':
        // No navigation for all-time view
        break
    }
  }

  const goToNextPeriod = () => {
    const today = new Date()
    let nextPeriod
    
    switch (viewMode) {
      case 'day':
        nextPeriod = addDays(selectedDate, 1)
        break
      case 'week':
        nextPeriod = addWeeks(selectedDate, 1)
        break
      case 'month':
        nextPeriod = addMonths(selectedDate, 1)
        break
      case 'year':
        nextPeriod = addYears(selectedDate, 1)
        break
      case 'all':
        return // No navigation for all-time view
    }
    
    if (nextPeriod && nextPeriod <= today) {
      setSelectedDate(nextPeriod)
    }
  }

  const canGoNext = () => {
    if (viewMode === 'all') return false
    
    const today = new Date()
    let nextPeriod
    
    switch (viewMode) {
      case 'day':
        nextPeriod = addDays(selectedDate, 1)
        break
      case 'week':
        nextPeriod = addWeeks(selectedDate, 1)
        break
      case 'month':
        nextPeriod = addMonths(selectedDate, 1)
        break
      case 'year':
        nextPeriod = addYears(selectedDate, 1)
        break
    }
    
    return nextPeriod && nextPeriod <= today
  }

  const goToToday = () => {
    setSelectedDate(startOfDay(new Date()))
  }


  const isToday = viewMode === 'day' && selectedDate.getTime() === startOfDay(new Date()).getTime()

  const handleDelete = (entryId) => {
    deleteEntry(entryId)
    setDeleteConfirm(null)
  }

  const toggleMealCollapse = (mealType) => {
    const newCollapsed = new Set(collapsedMeals)
    if (newCollapsed.has(mealType)) {
      newCollapsed.delete(mealType)
    } else {
      newCollapsed.add(mealType)
    }
    setCollapsedMeals(newCollapsed)
  }

  return (
    <div className="history">
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
      <div className="history-header">
        <h2>Food History</h2>
        <p className="subtitle">Review your past meals and nutrition</p>
      </div>

      <div className="view-selector">
        <div className="view-mode-tabs">
          {[
            { key: 'day', label: 'Day', icon: Calendar },
            { key: 'week', label: 'Week', icon: BarChart3 },
            { key: 'month', label: 'Month', icon: TrendingUp },
            { key: 'year', label: 'Year', icon: TrendingUp },
            { key: 'all', label: 'All Time', icon: TrendingUp }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className={`view-tab ${viewMode === key ? 'active' : ''}`}
              onClick={() => setViewMode(key)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {viewMode !== 'all' && (
        <div className="date-navigation">
          <button
            className="date-nav-btn"
            onClick={goToPreviousPeriod}
          >
            <ChevronLeft size={24} />
          </button>

          <div className="date-display">
            <Calendar size={24} />
            <div className="date-info">
              <span className="date-main">
                {viewMode === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                {viewMode === 'week' && `Week of ${format(startOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d')} - ${format(endOfWeek(selectedDate, { weekStartsOn: 1 }), 'MMM d, yyyy')}`}
                {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
                {viewMode === 'year' && format(selectedDate, 'yyyy')}
              </span>
              {viewMode === 'day' && isToday && <span className="date-badge">Today</span>}
            </div>
          </div>

          <button
            className="date-nav-btn"
            onClick={goToNextPeriod}
            disabled={!canGoNext()}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {!isToday && viewMode === 'day' && (
        <button className="today-btn" onClick={goToToday}>
          Jump to Today
        </button>
      )}

      {selectedDateEntries.length > 0 && (
        <div className="search-container">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder={viewMode === 'day' ? "Search foods for this day..." : "Search foods in this period..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                className="clear-search"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="search-results">
              {selectedDateEntries.length} result{selectedDateEntries.length === 1 ? '' : 's'} for "{searchTerm}"
            </p>
          )}
        </div>
      )}

      <div className="period-summary">
        <div className="summary-grid">
          <div className="summary-card">
            <Flame size={24} />
            <div>
              <span className="summary-label">
                {viewMode === 'day' ? 'Total Calories' : 'Total Calories'}
              </span>
              <span className="summary-value">{Math.round(dateStats.total)} kcal</span>
            </div>
          </div>
          
          {viewMode !== 'day' && (
            <div className="summary-card">
              <TrendingUp size={24} />
              <div>
                <span className="summary-label">Avg per Day</span>
                <span className="summary-value">{Math.round(dateStats.avgCaloriesPerDay)} kcal</span>
              </div>
            </div>
          )}
          
          <div className="summary-card">
            <span className="macro-icon">P</span>
            <div>
              <span className="summary-label">
                {viewMode === 'day' ? 'Protein' : `Protein (${Math.round(dateStats.avgProteinPerDay)}g/day)`}
              </span>
              <span className="summary-value">{Math.round(dateStats.protein)}g</span>
            </div>
          </div>
          
          <div className="summary-card">
            <span className="macro-icon">C</span>
            <div>
              <span className="summary-label">Carbs</span>
              <span className="summary-value">{Math.round(dateStats.carbs)}g</span>
            </div>
          </div>
          
          <div className="summary-card">
            <span className="macro-icon">F</span>
            <div>
              <span className="summary-label">Fat</span>
              <span className="summary-value">{Math.round(dateStats.fat)}g</span>
            </div>
          </div>

          {viewMode !== 'day' && (
            <>
              <div className="summary-card">
                <Calendar size={24} />
                <div>
                  <span className="summary-label">Days Tracked</span>
                  <span className="summary-value">{dateStats.uniqueDays}</span>
                </div>
              </div>
              
              <div className="summary-card">
                <BarChart3 size={24} />
                <div>
                  <span className="summary-label">Total Entries</span>
                  <span className="summary-value">{dateStats.totalEntries}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {selectedDateEntries.length > 0 ? (
        viewMode === 'day' ? (
          <div className="history-meals">
            {Object.entries(mealIcons).map(([meal, Icon]) => {
              const mealEntries = getMealEntries(meal)
              if (mealEntries.length === 0) return null

              const isCollapsed = collapsedMeals.has(meal)
              const CollapseIcon = isCollapsed ? ChevronRight : ChevronDown

              return (
                <div key={meal} className={`history-meal-section ${isCollapsed ? 'collapsed' : ''}`}>
                  <button 
                    className="history-meal-header"
                    onClick={() => toggleMealCollapse(meal)}
                  >
                    <div className="history-meal-title">
                      <div className="history-meal-icon">
                        <Icon size={24} />
                      </div>
                      <div>
                        <h4>{meal.charAt(0).toUpperCase() + meal.slice(1)}</h4>
                        <span className="history-meal-calories">
                          {Math.round(dateStats[meal])} kcal
                        </span>
                      </div>
                    </div>
                    <div className="history-meal-controls">
                      <span className="history-meal-count">
                        {mealEntries.length} {mealEntries.length === 1 ? 'item' : 'items'}
                      </span>
                      <CollapseIcon size={20} className="collapse-icon" />
                    </div>
                  </button>

                  {!isCollapsed && (
                    <div className="history-table">
                      <div className="table-header">
                        <div className="col-time">Time</div>
                        <div className="col-food">Food</div>
                        <div className="col-amount">Amount</div>
                        <div className="col-calories">Calories</div>
                        <div className="col-protein">Protein</div>
                        <div className="col-carbs">Carbs</div>
                        <div className="col-fat">Fat</div>
                        <div className="col-actions">Actions</div>
                      </div>
                      {mealEntries.map((entry, index) => (
                        <div key={index} className="table-row">
                          <div className="col-time">
                            {format(new Date(entry.date), 'HH:mm')}
                          </div>
                          <div className="col-food">{entry.foodName}</div>
                          <div className="col-amount">
                            {entry.amount}{entry.unit}
                          </div>
                          <div className="col-calories">
                            <Flame size={14} />
                            {Math.round(entry.calories)}
                          </div>
                          <div className="col-protein">{Math.round(entry.protein)}g</div>
                          <div className="col-carbs">{Math.round(entry.carbs)}g</div>
                          <div className="col-fat">{Math.round(entry.fat)}g</div>
                          <div className="col-actions">
                            <button
                              className="delete-btn"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(entry.id)
                              }}
                              title="Delete entry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="period-entries">
            <div className="period-table">
              <div className="table-header">
                <div className="col-date">Date</div>
                <div className="col-food">Food</div>
                <div className="col-meal">Meal</div>
                <div className="col-amount">Amount</div>
                <div className="col-calories">Calories</div>
                <div className="col-protein">Protein</div>
                <div className="col-actions">Actions</div>
              </div>
              {selectedDateEntries.map((entry, index) => (
                <div key={index} className="table-row">
                  <div className="col-date">
                    {format(new Date(entry.date), viewMode === 'all' ? 'MMM d, yyyy' : 'MMM d')}
                  </div>
                  <div className="col-food">{entry.foodName}</div>
                  <div className="col-meal">
                    <span className={`meal-badge ${entry.mealType}`}>
                      {entry.mealType.charAt(0).toUpperCase() + entry.mealType.slice(1)}
                    </span>
                  </div>
                  <div className="col-amount">
                    {entry.amount}{entry.unit}
                  </div>
                  <div className="col-calories">
                    <Flame size={14} />
                    {Math.round(entry.calories)}
                  </div>
                  <div className="col-protein">{Math.round(entry.protein)}g</div>
                  <div className="col-actions">
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
          </div>
        )
      ) : (
        <div className="no-entries">
          <Calendar size={64} />
          <h3>No entries for this {viewMode}</h3>
          <p>
            {viewMode === 'day' && `No food was tracked on ${format(selectedDate, 'MMMM d, yyyy')}`}
            {viewMode === 'week' && `No food was tracked during this week`}
            {viewMode === 'month' && `No food was tracked in ${format(selectedDate, 'MMMM yyyy')}`}
            {viewMode === 'year' && `No food was tracked in ${format(selectedDate, 'yyyy')}`}
            {viewMode === 'all' && `No food entries found`}
          </p>
        </div>
      )}
    </div>
  )
}

export default History