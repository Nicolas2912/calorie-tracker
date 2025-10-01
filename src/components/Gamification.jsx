import { useMemo } from 'react'
import { Award, TrendingUp, Flame, Target, Star, Trophy, Zap, Activity, Crown, Medal, Sparkles, Calendar } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, subDays, startOfDay, eachDayOfInterval } from 'date-fns'
import './Gamification.css'

function Gamification({ achievements, entries, kfaHistory }) {
  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayEntries = entries.filter(e => new Date(e.date).toDateString() === today)

    // Calculate streak
    const uniqueDays = [...new Set(entries.map(e => new Date(e.date).toDateString()))]
    let streak = 0
    let currentDate = new Date()

    for (let i = 0; i < 365; i++) {
      const dateStr = currentDate.toDateString()
      if (uniqueDays.includes(dateStr)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (i > 0) {
        break
      } else {
        currentDate.setDate(currentDate.getDate() - 1)
      }
    }

    // Calculate level based on total entries
    const level = Math.floor(entries.length / 10) + 1
    const progressToNextLevel = ((entries.length % 10) / 10) * 100

    // Perfect days (days with 4 meals tracked)
    const perfectDays = uniqueDays.filter(day => {
      const dayEntries = entries.filter(e => new Date(e.date).toDateString() === day)
      const mealTypes = new Set(dayEntries.map(e => e.mealType))
      return mealTypes.size === 4
    }).length

    return {
      streak,
      level,
      progressToNextLevel,
      totalEntries: entries.length,
      perfectDays,
      todayEntriesCount: todayEntries.length,
      kfaMeasurements: kfaHistory.length
    }
  }, [entries, kfaHistory])

  const achievementsList = useMemo(() => {
    const all = [
      {
        id: 'first-entry',
        icon: Star,
        title: 'First Steps',
        description: 'Log your first meal',
        unlocked: entries.length >= 1,
        progress: Math.min(entries.length, 1)
      },
      {
        id: 'week-streak',
        icon: Flame,
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        unlocked: stats.streak >= 7,
        progress: Math.min(stats.streak / 7, 1)
      },
      {
        id: 'month-streak',
        icon: Flame,
        title: 'Monthly Master',
        description: 'Maintain a 30-day streak',
        unlocked: stats.streak >= 30,
        progress: Math.min(stats.streak / 30, 1)
      },
      {
        id: 'perfect-day',
        icon: Target,
        title: 'Perfect Day',
        description: 'Track all 4 meals in a day',
        unlocked: stats.perfectDays >= 1,
        progress: Math.min(stats.perfectDays, 1)
      },
      {
        id: 'perfect-week',
        icon: Trophy,
        title: 'Perfect Week',
        description: 'Track all meals for 7 consecutive days',
        unlocked: stats.perfectDays >= 7,
        progress: Math.min(stats.perfectDays / 7, 1)
      },
      {
        id: 'century',
        icon: TrendingUp,
        title: 'Century Club',
        description: 'Log 100 entries',
        unlocked: entries.length >= 100,
        progress: Math.min(entries.length / 100, 1)
      },
      {
        id: 'kfa-tracker',
        icon: Activity,
        title: 'Body Aware',
        description: 'Track your KFA 5 times',
        unlocked: kfaHistory.length >= 5,
        progress: Math.min(kfaHistory.length / 5, 1)
      },
      {
        id: 'level-5',
        icon: Zap,
        title: 'Rising Star',
        description: 'Reach level 5',
        unlocked: stats.level >= 5,
        progress: Math.min(stats.level / 5, 1)
      },
      {
        id: 'level-10',
        icon: Trophy,
        title: 'Expert Tracker',
        description: 'Reach level 10',
        unlocked: stats.level >= 10,
        progress: Math.min(stats.level / 10, 1)
      }
    ]

    return all
  }, [entries, stats, kfaHistory])

  const unlockedCount = achievementsList.filter(a => a.unlocked).length

  // Psychology-driven visualizations: Show progress over time to trigger "Progress Principle"
  const progressData = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    })

    return last30Days.map(date => {
      const dateStr = startOfDay(date).getTime()
      const dayEntries = entries.filter(e => startOfDay(new Date(e.date)).getTime() === dateStr)
      return {
        date: format(date, 'MMM dd'),
        entries: dayEntries.length,
        calories: dayEntries.reduce((sum, e) => sum + e.calories, 0),
        hasEntry: dayEntries.length > 0 ? 1 : 0
      }
    })
  }, [entries])

  // Streak visualization for loss aversion motivation
  const streakData = useMemo(() => {
    const last14Days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date()
    })

    return last14Days.map(date => {
      const dateStr = startOfDay(date).getTime()
      const dayEntries = entries.filter(e => startOfDay(new Date(e.date)).getTime() === dateStr)
      return {
        date: format(date, 'EEE'),
        active: dayEntries.length > 0,
        entries: dayEntries.length
      }
    })
  }, [entries])

  // Achievement unlock timeline - triggers "small wins" dopamine
  const achievementTimeline = useMemo(() => {
    const milestones = [
      { level: 1, label: 'Level 1', unlocked: stats.level >= 1 },
      { level: 3, label: 'Level 3', unlocked: stats.level >= 3 },
      { level: 5, label: 'Level 5', unlocked: stats.level >= 5 },
      { level: 10, label: 'Level 10', unlocked: stats.level >= 10 },
      { level: 15, label: 'Level 15', unlocked: stats.level >= 15 },
      { level: 20, label: 'Level 20', unlocked: stats.level >= 20 }
    ]
    return milestones
  }, [stats.level])

  // Consistency score - gamification of habit formation
  const consistencyScore = useMemo(() => {
    const last7Days = progressData.slice(-7)
    const daysWithEntries = last7Days.filter(d => d.hasEntry).length
    return Math.round((daysWithEntries / 7) * 100)
  }, [progressData])

  // Get level tier for visual effects
  const getLevelTier = (level) => {
    if (level >= 20) return { name: 'Legendary', icon: Crown, color: '#FFD700' }
    if (level >= 15) return { name: 'Epic', icon: Trophy, color: '#9333ea' }
    if (level >= 10) return { name: 'Expert', icon: Medal, color: '#10b981' }
    if (level >= 5) return { name: 'Advanced', icon: Star, color: '#3b82f6' }
    return { name: 'Beginner', icon: Sparkles, color: '#6366f1' }
  }

  const levelTier = getLevelTier(stats.level)
  const LevelIcon = levelTier.icon

  return (
    <div className="gamification">
      <div className="gamification-header">
        <h2>Your Achievements</h2>
        <p className="subtitle">Keep tracking to unlock more rewards</p>
      </div>

      <div className="level-section">
        <div className="level-card" style={{ borderColor: levelTier.color }}>
          <div className="level-icon" style={{
            background: `linear-gradient(135deg, ${levelTier.color} 0%, ${levelTier.color}88 100%)`,
            boxShadow: `0 8px 24px ${levelTier.color}66`
          }}>
            <LevelIcon size={48} />
          </div>
          <div className="level-content">
            <span className="level-label">{levelTier.name} Tier</span>
            <div className="level-display">
              <span className="level-value">{stats.level}</span>
              <span className="level-tier-badge" style={{ background: levelTier.color }}>
                {levelTier.name}
              </span>
            </div>
            <div className="level-progress">
              <div className="level-progress-bar">
                <div
                  className="level-progress-fill"
                  style={{
                    width: `${stats.progressToNextLevel}%`,
                    background: `linear-gradient(90deg, ${levelTier.color} 0%, ${levelTier.color}cc 100%)`
                  }}
                />
              </div>
              <span className="level-progress-text">
                {stats.totalEntries % 10}/10 entries to level {stats.level + 1}
              </span>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-mini stat-streak">
            <div className="stat-mini-icon">
              <Flame size={28} />
            </div>
            <div>
              <span className="stat-mini-value">{stats.streak}</span>
              <span className="stat-mini-label">Day Streak</span>
            </div>
            {stats.streak >= 7 && <div className="stat-glow"></div>}
          </div>

          <div className="stat-mini stat-perfect">
            <div className="stat-mini-icon">
              <Target size={28} />
            </div>
            <div>
              <span className="stat-mini-value">{stats.perfectDays}</span>
              <span className="stat-mini-label">Perfect Days</span>
            </div>
            {stats.perfectDays >= 5 && <div className="stat-glow"></div>}
          </div>

          <div className="stat-mini stat-entries">
            <div className="stat-mini-icon">
              <TrendingUp size={28} />
            </div>
            <div>
              <span className="stat-mini-value">{stats.totalEntries}</span>
              <span className="stat-mini-label">Total Entries</span>
            </div>
          </div>

          <div className="stat-mini stat-achievements">
            <div className="stat-mini-icon">
              <Award size={28} />
            </div>
            <div>
              <span className="stat-mini-value">{unlockedCount}/{achievementsList.length}</span>
              <span className="stat-mini-label">Unlocked</span>
            </div>
            <div className="stat-progress-ring">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="var(--bg-tertiary)"
                  strokeWidth="4"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke={levelTier.color}
                  strokeWidth="4"
                  strokeDasharray={`${(unlockedCount / achievementsList.length) * 163.36} 163.36`}
                  strokeLinecap="round"
                  transform="rotate(-90 30 30)"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Celebration Banner */}
      {(stats.streak >= 30 || stats.level >= 10 || unlockedCount === achievementsList.length) && (
        <div className="milestone-banner">
          <div className="milestone-stars">
            <Star size={24} />
            <Star size={32} />
            <Star size={24} />
          </div>
          <div className="milestone-content">
            <h3>Outstanding Achievement!</h3>
            <p>
              {stats.streak >= 30 && "You've maintained a 30+ day streak - incredible dedication!"}
              {stats.level >= 10 && stats.streak < 30 && "You've reached Expert level - you're a tracking master!"}
              {unlockedCount === achievementsList.length && "Perfect! You've unlocked all achievements!"}
            </p>
          </div>
        </div>
      )}

      {/* Psychology-Based Motivation Graphs */}
      <div className="motivation-graphs">
        <h3>
          <TrendingUp size={24} />
          Your Progress Journey
        </h3>
        <p className="section-subtitle">
          Visualizing your consistency builds motivation and reinforces positive habits
        </p>

        {/* Consistency Score - Social proof and immediate feedback */}
        <div className="consistency-card">
          <div className="consistency-header">
            <div>
              <h4>Weekly Consistency Score</h4>
              <p>Your tracking reliability over the last 7 days</p>
            </div>
            <div className="consistency-score-circle">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="var(--bg-tertiary)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={consistencyScore >= 80 ? '#10b981' : consistencyScore >= 50 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  strokeDasharray={`${(consistencyScore / 100) * 251.2} 251.2`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="consistency-score-text">
                <span className="score-value">{consistencyScore}%</span>
              </div>
            </div>
          </div>
          <div className="consistency-message">
            {consistencyScore === 100 && (
              <p className="message-perfect">🎯 Perfect consistency! You're unstoppable!</p>
            )}
            {consistencyScore >= 80 && consistencyScore < 100 && (
              <p className="message-great">⭐ Excellent consistency! Keep it up!</p>
            )}
            {consistencyScore >= 50 && consistencyScore < 80 && (
              <p className="message-good">💪 Good progress! Try to track every day this week.</p>
            )}
            {consistencyScore < 50 && (
              <p className="message-improve">🎯 Let's build that habit! Small steps lead to big changes.</p>
            )}
          </div>
        </div>

        {/* Activity Heatmap - Visual representation of commitment */}
        <div className="graph-card">
          <h4>
            <Calendar size={20} />
            14-Day Activity Heatmap
          </h4>
          <p className="graph-subtitle">Don't break the chain! Each day you track reinforces the habit.</p>
          <div className="heatmap-container">
            {streakData.map((day, index) => (
              <div key={index} className="heatmap-day">
                <div
                  className={`heatmap-cell ${day.active ? 'active' : 'inactive'}`}
                  style={{
                    backgroundColor: day.active
                      ? `rgba(16, 185, 129, ${Math.min(day.entries / 5, 1)})`
                      : 'var(--bg-tertiary)'
                  }}
                >
                  {day.entries > 0 && <span className="entry-count">{day.entries}</span>}
                </div>
                <span className="heatmap-label">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Line Chart - Shows improvement trajectory */}
        <div className="graph-card">
          <h4>
            <TrendingUp size={20} />
            30-Day Entry Trend
          </h4>
          <p className="graph-subtitle">The more you track, the more aware you become. Awareness drives change.</p>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={progressData}>
              <defs>
                <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={levelTier.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={levelTier.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                tick={{ fontSize: 12 }}
                interval={4}
              />
              <YAxis
                stroke="var(--text-muted)"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)'
                }}
              />
              <Area
                type="monotone"
                dataKey="entries"
                stroke={levelTier.color}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEntries)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Level Milestone Timeline - Goal gradient effect */}
        <div className="graph-card">
          <h4>
            <Trophy size={20} />
            Level Milestone Journey
          </h4>
          <p className="graph-subtitle">Every level unlocked is a testament to your dedication. Which will you reach next?</p>
          <div className="milestone-timeline">
            {achievementTimeline.map((milestone, index) => (
              <div key={index} className="timeline-item">
                <div className={`timeline-marker ${milestone.unlocked ? 'unlocked' : 'locked'}`}>
                  {milestone.unlocked ? (
                    <Trophy size={20} />
                  ) : (
                    <span className="level-number">{milestone.level}</span>
                  )}
                </div>
                <div className="timeline-content">
                  <span className={milestone.unlocked ? 'unlocked-text' : 'locked-text'}>
                    {milestone.label}
                  </span>
                </div>
                {index < achievementTimeline.length - 1 && (
                  <div className={`timeline-connector ${milestone.unlocked && achievementTimeline[index + 1].unlocked ? 'completed' : ''}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="achievements-section">
        <h3>
          <Award size={24} />
          Achievements ({unlockedCount}/{achievementsList.length})
        </h3>

        <div className="achievements-grid">
          {achievementsList.map(achievement => {
            const Icon = achievement.icon
            return (
              <div
                key={achievement.id}
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
              >
                <div className="achievement-icon">
                  <Icon size={32} />
                </div>
                <div className="achievement-content">
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                  {!achievement.unlocked && (
                    <div className="achievement-progress">
                      <div className="achievement-progress-bar">
                        <div
                          className="achievement-progress-fill"
                          style={{ width: `${achievement.progress * 100}%` }}
                        />
                      </div>
                      <span className="achievement-progress-text">
                        {Math.round(achievement.progress * 100)}%
                      </span>
                    </div>
                  )}
                  {achievement.unlocked && (
                    <div className="achievement-unlocked">
                      <Star size={16} />
                      Unlocked!
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Dynamic Motivation Section */}
      {stats.streak > 0 && (
        <div className="motivation-section">
          <div className={`motivation-card ${stats.streak >= 7 ? 'motivation-fire' : ''}`}>
            <div className="motivation-icon-stack">
              <Flame size={48} className="flame-icon" />
              {stats.streak >= 7 && <Flame size={36} className="flame-icon-small" />}
              {stats.streak >= 30 && <Flame size={24} className="flame-icon-tiny" />}
            </div>
            <div className="motivation-content">
              <h3>
                {stats.streak >= 30 ? "🔥 You're on fire! Unstoppable!" :
                 stats.streak >= 7 ? "🔥 Keep the streak alive!" :
                 "Keep going!"}
              </h3>
              <p>
                {stats.streak >= 30 ? `Amazing ${stats.streak}-day streak! You're in the elite club.` :
                 stats.streak >= 7 ? `${stats.streak} consecutive days! You're building an incredible habit.` :
                 `${stats.streak} day${stats.streak > 1 ? 's' : ''} tracked. Don't break the chain!`}
              </p>
              {stats.streak >= 7 && (
                <div className="streak-milestones">
                  <div className={`streak-milestone ${stats.streak >= 7 ? 'completed' : ''}`}>
                    <div className="milestone-dot"></div>
                    <span>7 days</span>
                  </div>
                  <div className="milestone-line"></div>
                  <div className={`streak-milestone ${stats.streak >= 14 ? 'completed' : ''}`}>
                    <div className="milestone-dot"></div>
                    <span>14 days</span>
                  </div>
                  <div className="milestone-line"></div>
                  <div className={`streak-milestone ${stats.streak >= 30 ? 'completed' : ''}`}>
                    <div className="milestone-dot"></div>
                    <span>30 days</span>
                  </div>
                  <div className="milestone-line"></div>
                  <div className={`streak-milestone ${stats.streak >= 100 ? 'completed' : ''}`}>
                    <div className="milestone-dot"></div>
                    <span>100 days</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="tips-section">
        <h3>Tips to Level Up</h3>
        <div className="tips-grid">
          <div className="tip-card">
            <Target size={24} />
            <p>Track all 4 meals daily for perfect day achievements</p>
          </div>
          <div className="tip-card">
            <Flame size={24} />
            <p>Build your streak by logging at least one entry per day</p>
          </div>
          <div className="tip-card">
            <TrendingUp size={24} />
            <p>Every 10 entries unlocks a new level</p>
          </div>
          <div className="tip-card">
            <Activity size={24} />
            <p>Regularly track your KFA to unlock body composition achievements</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Gamification