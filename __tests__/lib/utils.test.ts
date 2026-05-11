import { generateId, getDaysUntil } from '@/lib/utils'

test('generateId: ユニークなIDを生成する', () => {
  const id1 = generateId()
  const id2 = generateId()
  expect(id1).not.toBe(id2)
  expect(typeof id1).toBe('string')
  expect(id1.length).toBeGreaterThan(0)
})

test('getDaysUntil: 今日の日付を渡すと0を返す', () => {
  const today = new Date().toISOString().slice(0, 10)
  expect(getDaysUntil(today)).toBe(0)
})

test('getDaysUntil: 7日後の日付を渡すと7を返す', () => {
  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  expect(getDaysUntil(future)).toBe(7)
})

test('getDaysUntil: undefinedを渡すとnullを返す', () => {
  expect(getDaysUntil(undefined)).toBeNull()
})

test('getDaysUntil: 過去の日付を渡すと負の値を返す', () => {
  const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)
  expect(getDaysUntil(past)).toBeLessThan(0)
})
