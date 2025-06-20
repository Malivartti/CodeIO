import { ActivityDay } from '@shared/types/userStats';
import { FC } from 'react';

interface Props {
  activityDays: ActivityDay[];
  totalSolved: number;
  averagePerMonth: number;
  averagePerWeek: number;
}

const ActivityCalendar: FC<Props> = ({
  activityDays,
  totalSolved,
  averagePerMonth,
  averagePerWeek,
}) => {
  const generateYearCalendarData = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    const activityMap = activityDays.reduce((acc, day) => {
      acc[day.date] = day.count;
      return acc;
    }, {} as Record<string, number>);

    const yearStart = new Date(currentYear, 0, 1);
    let startDate = new Date(yearStart);

    const dayOfWeek = yearStart.getDay();
    startDate.setDate(yearStart.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const weeks = [];
    let currentDate = new Date(startDate);

    while (currentDate.getFullYear() <= currentYear) {
      const week = [];
      const weekStart = new Date(currentDate);

      for (let day = 0; day < 7; day++) {
        const dayDate = new Date(currentDate);
        const dateString = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
        const activityCount = activityMap[dateString] || 0;
        const isToday = dateString === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const isFuture = dayDate > now;
        const isCurrentYear = dayDate.getFullYear() === currentYear;

        week.push({
          date: dateString,
          activityCount,
          isToday,
          isFuture,
          isCurrentYear,
          dayOfMonth: dayDate.getDate(),
          month: dayDate.getMonth(),
          dayOfWeek: day,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(week);

      if (weekStart.getFullYear() > currentYear) {
        break;
      }
    }

    return weeks;
  };

  const generateMonthHeaders = (weeks: any[]) => {
    const monthHeaders = [];
    let currentDisplayedMonth = -1;

    for (let weekIndex = 0; weekIndex < weeks.length; weekIndex++) {
      const week = weeks[weekIndex];

      const monthCounts: { [key: number]: number } = {};
      week.forEach((day: any) => {
        if (day.isCurrentYear) {
          monthCounts[day.month] = (monthCounts[day.month] || 0) + 1;
        }
      });

      let dominantMonth = -1;
      let maxCount = 0;
      for (const [month, count] of Object.entries(monthCounts)) {
        if (count > maxCount) {
          maxCount = count;
          dominantMonth = parseInt(month);
        }
      }

      if (dominantMonth !== -1 && dominantMonth !== currentDisplayedMonth) {
        const firstDayOfMonth = new Date(new Date().getFullYear(), dominantMonth, 1);
        const hasFirstWeekOfMonth = week.some((day: any) => {
          const dayDate = new Date(day.date);
          return dayDate.getMonth() === dominantMonth && dayDate.getDate() <= 7;
        });

        if (hasFirstWeekOfMonth || dominantMonth > currentDisplayedMonth) {
          monthHeaders.push({
            weekIndex,
            month: dominantMonth,
            name: firstDayOfMonth.toLocaleDateString('ru-RU', { month: 'short' }),
          });
          currentDisplayedMonth = dominantMonth;
        } else {
          monthHeaders.push(null);
        }
      } else {
        monthHeaders.push(null);
      }
    }

    return monthHeaders;
  };

  const weeks = generateYearCalendarData();
  const monthHeaders = generateMonthHeaders(weeks);
  const currentYear = new Date().getFullYear();

  const getActivityLevel = (count: number): number => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  };

  const getActivityColor = (level: number, isFuture: boolean, isCurrentYear: boolean) => {
    if (!isCurrentYear) return 'bg-surface-unaccent opacity-20';
    if (isFuture) return 'bg-surface-unaccent opacity-30';

    switch (level) {
      case 0:
        return 'bg-surface-unaccent hover:bg-surface-hover';
      case 1:
        return 'bg-success opacity-40 hover:bg-success-hover';
      case 2:
        return 'bg-success opacity-60 hover:bg-success-hover';
      case 3:
        return 'bg-success opacity-80 hover:bg-success-hover';
      case 4:
        return 'bg-success hover:bg-success-hover';
      default:
        return 'bg-surface-unaccent hover:bg-surface-hover';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getTooltipText = (day: any) => {
    const baseText = formatDate(day.date);
    if (day.activityCount > 0) {
      const taskWord = day.activityCount === 1 ? 'задача' :
        day.activityCount < 5 ? 'задачи' : 'задач';
      return `${baseText} - ${day.activityCount} ${taskWord} решено`;
    }
    return `${baseText} - Нет активности${day.isToday ? ' (сегодня)' : ''}`;
  };

  return (
    <div className="bg-surface border border-surface rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h3 className="text-lg font-semibold text-strong">Активность в {currentYear} году</h3>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-max">
          <div className="flex gap-1 mb-4 ml-8">
            {monthHeaders.map((monthData, index) => (
              <div
                key={index}
                className="w-3 text-xs text-subtle font-medium text-center"
              >
                {monthData?.name || ''}
              </div>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col gap-1 mr-1">
              <div className="h-3 w-6"></div>
              {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => (
                <div key={index} className="h-3 w-6 text-xs text-subtle text-right leading-3">
                  {index % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>

            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                <div className="h-3 w-3"></div>
                {week.map((day: any) => {
                  const activityLevel = getActivityLevel(day.activityCount);
                  const colorClass = getActivityColor(activityLevel, day.isFuture, day.isCurrentYear);

                  return (
                    <div
                      key={day.date}
                      className={`w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer group ${colorClass} ${
                        day.isToday ? 'ring-1 ring-brand ring-offset-1' : ''
                      }`}
                      title={getTooltipText(day)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface">
            <div className="flex items-center gap-2 text-xs text-subtle">
              <span>Меньше</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-surface-unaccent rounded-sm" title="Нет активности" />
                <div className="w-3 h-3 bg-success opacity-40 rounded-sm" title="1 задача" />
                <div className="w-3 h-3 bg-success opacity-60 rounded-sm" title="2-3 задачи" />
                <div className="w-3 h-3 bg-success opacity-80 rounded-sm" title="4-5 задач" />
                <div className="w-3 h-3 bg-success rounded-sm" title="6+ задач" />
              </div>
              <span>Больше</span>
            </div>

            <div className="text-xs text-subtle">
              Наведите курсор на квадрат для просмотра подробностей
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4 border-t border-surface">
        <div className="text-center">
          <div className="text-lg font-semibold text-strong">{totalSolved}</div>
          <div className="text-xs text-subtle">Дней активности</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-strong">
            {Math.round((totalSolved / 365) * 100)}%
          </div>
          <div className="text-xs text-subtle">От года</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-strong">
            {Math.round(averagePerMonth)}
          </div>
          <div className="text-xs text-subtle">В среднем в месяц</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-strong">
            {Math.round(averagePerWeek)}
          </div>
          <div className="text-xs text-subtle">В среднем в неделю</div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCalendar;
