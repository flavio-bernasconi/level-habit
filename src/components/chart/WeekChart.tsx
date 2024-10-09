import { cn } from '@/lib/utils'
import { useQuery } from 'convex/react'
import { addDays, format, isAfter, startOfWeek } from 'date-fns'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'

const today = new Date().toISOString()

export const WeekChart = ({ habitId }: { habitId: Id<'habits'> }) => {
  const startOfThisWeek = startOfWeek(today, { weekStartsOn: 1 })

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfThisWeek, i)
    return format(date, 'dd-MM-yyyy')
  })

  const weekHabits = useQuery(api.habitsByDate.getRangeDates, {
    startDate: weekDates[0],
    endDate: weekDates[6],
    habitId
  })

  if (!weekHabits) return null

  const reMap: {
    [date: string]: number | undefined
  } = weekHabits.reduce(
    (acc, habit) => {
      acc[habit.date] = habit.value
      return acc
    },
    {} as {
      [date: string]: number | undefined
    }
  )

  const firstDOW = startOfWeek(new Date(), { weekStartsOn: 1 })
  const shortWeekDaysArray = Array.from(Array(7)).map((_, i) =>
    format(addDays(firstDOW, i), 'EEEEEE')
  )

  return (
    <div className='flex gap-2'>
      {weekDates.map((date, i) => (
        <div key={i} className=' grid place-content-center'>
          <p className='text-sm'>{shortWeekDaysArray[i]}</p>
          <div
            className={cn(
              'h-6 w-6 bg-blue-200 text-slate-700 font-semibold rounded-full text-[10px] grid place-content-center m-0 p-1 border border-blue-400',
              isAfter(today, date) ? 'bg-blue-200' : 'bg-gray-200'
            )}
          >
            {reMap[date] ? (
              <p>
                <span className='text-[10px]'>+</span>
                {reMap[date]}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  )
}
