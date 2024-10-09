import type { Id } from '../convex/_generated/dataModel'

export const levelsKeys = {
  show: 'show',
  easy: 'easy',
  medium: 'medium',
  hard: 'hard'
} as const

export type Habit = {
  _id: Id<'habits'>
  name: string
  levelsDescription: {
    [key in keyof typeof levelsKeys]: string
  }
}

export type HabitByDate = {
  activeLevel?: keyof typeof levelsKeys
  value: number
  date: string
  habitId: Id<'habits'>
  _creationTime: number
  _id: Id<'habitsByDate'>
}
