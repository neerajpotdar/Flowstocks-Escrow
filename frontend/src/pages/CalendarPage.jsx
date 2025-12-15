import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const generateCalendarDays = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const days = [];

        // Empty slots for previous month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // Days of current month
        for (let i = 1; i <= totalDays; i++) {
            const isToday =
                i === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

            days.push(
                <div key={i} className={`calendar-day ${isToday ? 'today' : ''}`}>
                    <span className="day-number">{i}</span>
                    <div className="day-events">
                        {/* Placeholder for events */}
                    </div>
                </div>
            );
        }

        return days;
    };

    // Simple navigation
    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    return (
        <DashboardLayout>
            <div className="calendar-container">
                <div className="calendar-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <div className="calendar-nav">
                        <button onClick={prevMonth} className="nav-btn">←</button>
                        <button onClick={() => setCurrentDate(new Date())} className="nav-btn">Today</button>
                        <button onClick={nextMonth} className="nav-btn">→</button>
                    </div>
                </div>

                <div className="calendar-grid">
                    <div className="day-name">Sun</div>
                    <div className="day-name">Mon</div>
                    <div className="day-name">Tue</div>
                    <div className="day-name">Wed</div>
                    <div className="day-name">Thu</div>
                    <div className="day-name">Fri</div>
                    <div className="day-name">Sat</div>

                    {generateCalendarDays()}
                </div>
            </div>

            <style>{`
                .calendar-container {
                    background: var(--bg-card);
                    backdrop-filter: blur(10px);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-md);
                    border: 1px solid var(--border-color);
                    padding: 2rem;
                    height: calc(100vh - 140px);
                    display: flex;
                    flex-direction: column;
                }

                .calendar-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .nav-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid var(--border-color);
                    padding: 0.5rem 1rem;
                    border-radius: 0.5rem;
                    margin-left: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: var(--text-primary);
                }

                .nav-btn:hover {
                    background: var(--accent-primary);
                    border-color: var(--accent-primary);
                    color: white;
                }

                .calendar-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 1px;
                    background: var(--border-color);
                    border: 1px solid var(--border-color);
                    flex: 1;
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }

                .day-name {
                    background: rgba(255, 255, 255, 0.03);
                    padding: 1rem;
                    text-align: center;
                    font-weight: 600;
                    color: var(--text-muted);
                }

                .calendar-day {
                    background: var(--bg-card); /* Darker cell background */
                    min-height: 100px;
                    padding: 0.5rem;
                    position: relative;
                    transition: background 0.2s;
                }

                .calendar-day:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .calendar-day.empty {
                    background: rgba(0, 0, 0, 0.2);
                }

                .calendar-day.today {
                    background: rgba(124, 58, 237, 0.1); /* Subtle purple tint */
                    box-shadow: inset 0 0 0 1px var(--accent-primary);
                }

                .day-number {
                    font-weight: 600;
                    color: var(--text-secondary);
                    display: block;
                    margin-bottom: 0.5rem;
                }

                .calendar-day.today .day-number {
                    color: var(--accent-primary);
                    font-weight: 800;
                }
            `}</style>
        </DashboardLayout>
    );
};

export default CalendarPage;
