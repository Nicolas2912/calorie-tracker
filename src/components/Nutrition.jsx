import { useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { Heart, Zap, Shield, Target, TrendingUp } from 'lucide-react'
import './Nutrition.css'

// Daily recommended values (RDA)
const DAILY_GOALS = {
  fiber: 30,
  sugar: 50,
  vitaminA: 900,
  vitaminC: 90,
  vitaminD: 20,
  vitaminE: 15,
  vitaminK: 120,
  vitaminB6: 1.7,
  vitaminB12: 2.4,
  calcium: 1000,
  iron: 18,
  magnesium: 400,
  potassium: 3500,
  sodium: 2300,
  zinc: 11
}

function Nutrition({ entries }) {
  const [timeRange, setTimeRange] = useState(30)

  const today = startOfDay(new Date())

  const todayNutrition = useMemo(() => {
    const todayStr = today.toDateString()
    const todayEntries = entries.filter(e => new Date(e.date).toDateString() === todayStr)

    const totals = {
      fiber: 0,
      sugar: 0,
      vitaminA: 0,
      vitaminC: 0,
      vitaminD: 0,
      vitaminE: 0,
      vitaminK: 0,
      vitaminB6: 0,
      vitaminB12: 0,
      calcium: 0,
      iron: 0,
      magnesium: 0,
      potassium: 0,
      sodium: 0,
      zinc: 0
    }

    todayEntries.forEach(entry => {
      Object.keys(totals).forEach(nutrient => {
        totals[nutrient] += entry[nutrient] || 0
      })
    })

    return totals
  }, [entries, today])

  const historicalData = useMemo(() => {
    const days = []

    if (timeRange === 'all') {
      // Get all unique dates from entries
      const allDates = entries.map(e => startOfDay(new Date(e.date)).getTime())
      const uniqueDates = [...new Set(allDates)].sort((a, b) => a - b)

      uniqueDates.forEach(timestamp => {
        const date = new Date(timestamp)
        const dateStr = date.toDateString()

        const dayEntries = entries.filter(e =>
          new Date(e.date).toDateString() === dateStr
        )

        const stats = {
          date: format(date, 'MMM yyyy'),
          fullDate: format(date, 'MMM d, yyyy'),
          fiber: 0,
          sugar: 0,
          vitaminA: 0,
          vitaminC: 0,
          vitaminD: 0,
          vitaminE: 0,
          vitaminK: 0,
          vitaminB6: 0,
          vitaminB12: 0,
          calcium: 0,
          iron: 0,
          magnesium: 0,
          potassium: 0,
          sodium: 0,
          zinc: 0
        }

        dayEntries.forEach(entry => {
          Object.keys(stats).forEach(nutrient => {
            if (nutrient !== 'date' && nutrient !== 'fullDate') {
              stats[nutrient] += entry[nutrient] || 0
            }
          })
        })

        days.push(stats)
      })
    } else {
      for (let i = timeRange - 1; i >= 0; i--) {
        const date = subDays(today, i)
        const dateStr = date.toDateString()

        const dayEntries = entries.filter(e =>
          new Date(e.date).toDateString() === dateStr
        )

        const stats = {
          date: format(date, timeRange >= 365 ? 'MMM yyyy' : 'MMM d'),
          fullDate: format(date, 'MMM d, yyyy'),
          fiber: 0,
          sugar: 0,
          vitaminA: 0,
          vitaminC: 0,
          vitaminD: 0,
          vitaminE: 0,
          vitaminK: 0,
          vitaminB6: 0,
          vitaminB12: 0,
          calcium: 0,
          iron: 0,
          magnesium: 0,
          potassium: 0,
          sodium: 0,
          zinc: 0
        }

        dayEntries.forEach(entry => {
          Object.keys(stats).forEach(nutrient => {
            if (nutrient !== 'date' && nutrient !== 'fullDate') {
              stats[nutrient] += entry[nutrient] || 0
            }
          })
        })

        days.push(stats)
      }
    }

    return days
  }, [entries, timeRange, today])

  const averageNutrition = useMemo(() => {
    if (historicalData.length === 0) {
      return Object.keys(DAILY_GOALS).reduce((acc, key) => {
        acc[key] = 0
        return acc
      }, {})
    }

    const totals = historicalData.reduce((acc, day) => {
      Object.keys(DAILY_GOALS).forEach(nutrient => {
        acc[nutrient] = (acc[nutrient] || 0) + day[nutrient]
      })
      return acc
    }, {})

    const averages = {}
    Object.keys(totals).forEach(nutrient => {
      averages[nutrient] = totals[nutrient] / historicalData.length
    })

    return averages
  }, [historicalData])

  const getProgressPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100)
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'var(--secondary)'
    if (percentage >= 75) return 'var(--primary)'
    if (percentage >= 50) return 'var(--warning)'
    return 'var(--danger)'
  }

  const nutrientCategories = [
    {
      title: 'Other Macronutrients',
      icon: Heart,
      nutrients: [
        { key: 'fiber', label: 'Fiber', unit: 'g' },
        { key: 'sugar', label: 'Sugar', unit: 'g' }
      ]
    },
    {
      title: 'Vitamins',
      icon: Zap,
      nutrients: [
        { key: 'vitaminA', label: 'Vitamin A', unit: 'μg' },
        { key: 'vitaminC', label: 'Vitamin C', unit: 'mg' },
        { key: 'vitaminD', label: 'Vitamin D', unit: 'μg' },
        { key: 'vitaminE', label: 'Vitamin E', unit: 'mg' },
        { key: 'vitaminK', label: 'Vitamin K', unit: 'μg' },
        { key: 'vitaminB6', label: 'Vitamin B6', unit: 'mg' },
        { key: 'vitaminB12', label: 'Vitamin B12', unit: 'μg' }
      ]
    },
    {
      title: 'Minerals',
      icon: Shield,
      nutrients: [
        { key: 'calcium', label: 'Calcium', unit: 'mg' },
        { key: 'iron', label: 'Iron', unit: 'mg' },
        { key: 'magnesium', label: 'Magnesium', unit: 'mg' },
        { key: 'potassium', label: 'Potassium', unit: 'mg' },
        { key: 'sodium', label: 'Sodium', unit: 'mg' },
        { key: 'zinc', label: 'Zinc', unit: 'mg' }
      ]
    }
  ]

  const overallProgress = useMemo(() => {
    const allNutrients = Object.keys(DAILY_GOALS)
    const metCount = allNutrients.filter(key => {
      const percentage = getProgressPercentage(todayNutrition[key], DAILY_GOALS[key])
      return percentage >= 100
    }).length

    return {
      met: metCount,
      total: allNutrients.length,
      percentage: (metCount / allNutrients.length) * 100
    }
  }, [todayNutrition])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.fullDate}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)}{entry.unit || 'g'}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="nutrition">
      <div className="nutrition-header">
        <div>
          <h2>Nutrition Goals</h2>
          <p className="subtitle">Track your micronutrients and vitamins</p>
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

      <div className="overall-progress-card">
        <div className="overall-icon">
          <Target size={48} />
        </div>
        <div className="overall-content">
          <h3>Daily Nutrition Goals</h3>
          <p className="overall-stats">
            {overallProgress.met} of {overallProgress.total} nutrients met
          </p>
          <div className="overall-progress-bar">
            <div
              className="overall-progress-fill"
              style={{
                width: `${overallProgress.percentage}%`,
                background: getProgressColor(overallProgress.percentage)
              }}
            />
          </div>
          <span className="overall-percentage">
            {Math.round(overallProgress.percentage)}% Complete
          </span>
        </div>
      </div>

      {nutrientCategories.map(category => {
        const Icon = category.icon
        return (
          <div key={category.title} className="nutrient-category">
            <h3 className="category-title">
              <Icon size={24} />
              {category.title}
            </h3>
            <div className="nutrients-grid">
              {category.nutrients.map(nutrient => {
                const current = todayNutrition[nutrient.key]
                const goal = DAILY_GOALS[nutrient.key]
                const percentage = getProgressPercentage(current, goal)
                const color = getProgressColor(percentage)

                return (
                  <div key={nutrient.key} className="nutrient-card">
                    <div className="nutrient-header">
                      <span className="nutrient-label">{nutrient.label}</span>
                      <span className="nutrient-percentage" style={{ color }}>
                        {Math.round(percentage)}%
                      </span>
                    </div>
                    <div className="nutrient-values">
                      <span className="nutrient-current">
                        {current.toFixed(1)} {nutrient.unit}
                      </span>
                      <span className="nutrient-goal">
                        of {goal} {nutrient.unit}
                      </span>
                    </div>
                    <div className="nutrient-progress-bar">
                      <div
                        className="nutrient-progress-fill"
                        style={{
                          width: `${percentage}%`,
                          background: color
                        }}
                      />
                    </div>
                    {percentage >= 100 && (
                      <div className="nutrient-badge">Goal Met!</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {historicalData.length > 0 && (
        <div className="chart-section">
          <div className="chart-card full-width">
            <h3>
              <TrendingUp size={20} />
              Vitamin Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="vitaminC"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Vitamin C (mg)"
                  dot={{ fill: '#10b981', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="vitaminD"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Vitamin D (μg)"
                  dot={{ fill: '#6366f1', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="vitaminE"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Vitamin E (mg)"
                  dot={{ fill: '#f59e0b', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="vitaminB12"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Vitamin B12 (μg)"
                  dot={{ fill: '#ef4444', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card full-width">
            <h3>Mineral Intake Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="calcium" fill="#6366f1" name="Calcium (mg)" />
                <Bar dataKey="iron" fill="#10b981" name="Iron (mg)" />
                <Bar dataKey="magnesium" fill="#f59e0b" name="Magnesium (mg)" />
                <Bar dataKey="zinc" fill="#ef4444" name="Zinc (mg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Fiber & Sugar Tracking</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fiber"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Fiber (g)"
                  dot={{ fill: '#10b981', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="sugar"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Sugar (g)"
                  dot={{ fill: '#ef4444', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>B Vitamins Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="vitaminB6" fill="#6366f1" name="Vitamin B6 (mg)" />
                <Bar dataKey="vitaminB12" fill="#10b981" name="Vitamin B12 (μg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Potassium & Sodium Balance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="potassium"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Potassium (mg)"
                  dot={{ fill: '#10b981', r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="sodium"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Sodium (mg)"
                  dot={{ fill: '#ef4444', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h3>Fat-Soluble Vitamins (A, D, E, K)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#cbd5e1" />
                <YAxis stroke="#cbd5e1" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="vitaminA" fill="#6366f1" name="Vitamin A (μg)" />
                <Bar dataKey="vitaminD" fill="#10b981" name="Vitamin D (μg)" />
                <Bar dataKey="vitaminE" fill="#f59e0b" name="Vitamin E (mg)" />
                <Bar dataKey="vitaminK" fill="#ef4444" name="Vitamin K (μg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="nutrition-tips">
        <h3>Nutrition Tips</h3>
        <div className="tips-list">
          <div className="tip-item">
            <Heart size={20} />
            <p>Add diverse foods to meet all your micronutrient goals</p>
          </div>
          <div className="tip-item">
            <Zap size={20} />
            <p>Supplements can help fill nutritional gaps</p>
          </div>
          <div className="tip-item">
            <Shield size={20} />
            <p>Track supplements in the dedicated supplements section</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Nutrition