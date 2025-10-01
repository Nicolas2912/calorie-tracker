import { useMemo, useState } from 'react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { Calendar, TrendingUp, Activity } from 'lucide-react'
import './Statistics.css'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']

function Statistics({ entries }) {
  const [timeRange, setTimeRange] = useState(30)

  const dailyData = useMemo(() => {
    const days = []
    const today = startOfDay(new Date())

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
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }

        dayEntries.forEach(entry => {
          stats.calories += entry.calories
          stats.protein += entry.protein
          stats.carbs += entry.carbs
          stats.fat += entry.fat
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
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0
        }

        dayEntries.forEach(entry => {
          stats.calories += entry.calories
          stats.protein += entry.protein
          stats.carbs += entry.carbs
          stats.fat += entry.fat
        })

        days.push(stats)
      }
    }

    return days
  }, [entries, timeRange])

  const mealDistribution = useMemo(() => {
    const last7Days = subDays(new Date(), 7).toDateString()
    const recentEntries = entries.filter(e =>
      new Date(e.date) >= new Date(last7Days)
    )

    const distribution = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      snacks: 0
    }

    recentEntries.forEach(entry => {
      distribution[entry.mealType] += entry.calories
    })

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value)
    }))
  }, [entries])

  const macroDistribution = useMemo(() => {
    const last7Days = subDays(new Date(), 7).toDateString()
    const recentEntries = entries.filter(e =>
      new Date(e.date) >= new Date(last7Days)
    )

    let protein = 0, carbs = 0, fat = 0

    recentEntries.forEach(entry => {
      protein += entry.protein * 4
      carbs += entry.carbs * 4
      fat += entry.fat * 9
    })

    return [
      { name: 'Protein', value: Math.round(protein) },
      { name: 'Carbs', value: Math.round(carbs) },
      { name: 'Fat', value: Math.round(fat) }
    ]
  }, [entries])

  const averages = useMemo(() => {
    if (dailyData.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0 }

    const totals = dailyData.reduce((acc, day) => ({
      calories: acc.calories + day.calories,
      protein: acc.protein + day.protein,
      carbs: acc.carbs + day.carbs,
      fat: acc.fat + day.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

    return {
      calories: Math.round(totals.calories / dailyData.length),
      protein: Math.round(totals.protein / dailyData.length),
      carbs: Math.round(totals.carbs / dailyData.length),
      fat: Math.round(totals.fat / dailyData.length)
    }
  }, [dailyData])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.fullDate || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {Math.round(entry.value)}
              {entry.unit || (entry.name === 'calories' ? ' kcal' : 'g')}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="statistics">
      <div className="statistics-header">
        <h2>Statistics & Insights</h2>
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
      </div>

      <div className="averages-section">
        <div className="average-card">
          <Calendar size={24} />
          <div>
            <span className="average-label">Daily Average</span>
            <span className="average-value">{averages.calories} kcal</span>
          </div>
        </div>
        <div className="average-card">
          <Activity size={24} />
          <div>
            <span className="average-label">Protein</span>
            <span className="average-value">{averages.protein}g</span>
          </div>
        </div>
        <div className="average-card">
          <Activity size={24} />
          <div>
            <span className="average-label">Carbs</span>
            <span className="average-value">{averages.carbs}g</span>
          </div>
        </div>
        <div className="average-card">
          <Activity size={24} />
          <div>
            <span className="average-label">Fat</span>
            <span className="average-value">{averages.fat}g</span>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-card full-width">
          <h3>
            <TrendingUp size={20} />
            Calorie Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ fill: '#6366f1', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card full-width">
          <h3>Macronutrients Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="protein" fill="#10b981" name="Protein (g)" />
              <Bar dataKey="carbs" fill="#f59e0b" name="Carbs (g)" />
              <Bar dataKey="fat" fill="#ef4444" name="Fat (g)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Meal Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mealDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {mealDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Macro Calories (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={macroDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {macroDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Statistics