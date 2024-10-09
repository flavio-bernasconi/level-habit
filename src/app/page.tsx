'use client'
import { WeekChart } from '@/components/chart/WeekChart'
import { CreateNewHabit } from '@/components/common/CreateNewHabit'
import { EditHabit } from '@/components/common/EditHabit'
import { RemoveHabit } from '@/components/common/RemoveHabit'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { getCurrentLevel, getLevelProgress } from '@/helpers/function'
import useStoreUserEffect from '@/hooks/useStoreUser'
import { cn } from '@/lib/utils'
import { DotsVerticalIcon } from '@radix-ui/react-icons'
import { useMutation, useQuery } from 'convex/react'
import { format } from 'date-fns'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import type { HabitByDate } from '../../types'

const today = format(new Date(), 'dd-MM-yyyy')

export default function Home() {
  useStoreUserEffect()
  const habits = useQuery(api.habits.get)
  const levels = useQuery(api.levels.get)
  const totalCounter = useQuery(api.habits.getTotalCounter) ?? 0
  const habitByDate = useQuery(api.habitsByDate.get, {
    date: today
  })

  const editDateHabit = useMutation(api.habitsByDate.createOrUpdateHabitByDate)

  const orderByHabitId:
    | {
        [id: Id<'habits'>]: HabitByDate
      }
    | undefined = habitByDate?.reduce(
    (acc, h) => {
      acc[h.habitId as Id<'habits'>] = {
        ...h
      }
      return acc
    },
    {} as { [id: Id<'habits'>]: HabitByDate }
  )

  const currentLevel = getCurrentLevel(totalCounter ?? 0)
  const currentProgress = getLevelProgress(totalCounter ?? 0)

  return (
    <div className='h-auto p-4 mx-auto max-w-3xl relative'>
      <div className='w-full space-y-2 mb-8'>
        <p className='text-4xl'>Level: {currentLevel.level}</p>
        <p className='text-xl'>Points: {totalCounter}</p>
        <Progress value={currentProgress.percentage} />
        <p className='text-md'>
          points for the next level: {currentLevel.totalPointsToNextLevel}
        </p>
        <CreateNewHabit />
      </div>

      <div className='pb-28 flex flex-col gap-4'>
        {habits?.map(habit => {
          const savedLevel = orderByHabitId?.[habit._id]?.activeLevel
          return (
            <div
              key={habit._id}
              className='shadow-lg p-4 rounded-lg bg-slate-200 border border-slate-300'
            >
              <div className='flex justify-between gap-8 w-full items-start'>
                <h1 className='text-xl font-bold'>{habit.name}</h1>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant='secondary' size='icon'>
                      <DotsVerticalIcon fontSize={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <EditHabit
                      habit={habit}
                      trigger={
                        <DropdownMenuItem onSelect={e => e.preventDefault()}>
                          edit
                        </DropdownMenuItem>
                      }
                    />
                    <DropdownMenuSeparator />
                    <RemoveHabit
                      habit={habit}
                      trigger={
                        <DropdownMenuItem
                          onSelect={e => {
                            e.preventDefault()
                          }}
                        >
                          delete
                        </DropdownMenuItem>
                      }
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p>{savedLevel ? habit.levelsDescription[savedLevel] : '-'}</p>
              <div className='flex gap-4 my-4 justify-between'>
                <div className='flex gap-3'>
                  {levels?.map(level => (
                    <Button
                      className={cn(
                        !savedLevel ? 'bg-slate-800' : 'bg-slate-400',
                        savedLevel === level.id
                          ? 'bg-slate-800 hover:bg-slate-900'
                          : '',
                        'relative'
                      )}
                      key={level.id}
                      onClick={() => {
                        if (savedLevel === level.id) {
                          editDateHabit({
                            date: today,
                            habitId: habit._id,
                            activeLevel: undefined
                          })
                        } else {
                          editDateHabit({
                            date: today,
                            habitId: habit._id,
                            activeLevel: level.id,
                            value: level.value
                          })
                        }
                      }}
                    >
                      {savedLevel === level.id && (
                        <p className='absolute h-6 w-6 -top-3 -right-3 z-10 bg-blue-200 text-slate-700 rounded-full font-semibold text-[10px] grid place-content-center m-0 p-1 border border-blue-400'>
                          +{level.value}
                        </p>
                      )}
                      {level.label}
                    </Button>
                  ))}
                </div>
              </div>
              <WeekChart habitId={habit._id} />
            </div>
          )
        })}
      </div>
    </div>
  )
}
