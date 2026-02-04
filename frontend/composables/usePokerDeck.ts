import type { Card, CardValue } from '~/types'

// Standard Fibonacci deck
export const FIBONACCI_DECK: Card[] = [
  { value: '0', label: '0', numericValue: 0 },
  { value: '½', label: '½', numericValue: 0.5 },
  { value: '1', label: '1', numericValue: 1 },
  { value: '2', label: '2', numericValue: 2 },
  { value: '3', label: '3', numericValue: 3 },
  { value: '5', label: '5', numericValue: 5 },
  { value: '8', label: '8', numericValue: 8 },
  { value: '13', label: '13', numericValue: 13 },
  { value: '21', label: '21', numericValue: 21 },
  { value: '34', label: '34', numericValue: 34 },
  { value: '55', label: '55', numericValue: 55 },
  { value: '89', label: '89', numericValue: 89 },
  { value: '?', label: '?', numericValue: null },
  { value: '☕', label: '☕', numericValue: null },
]

// Modified Fibonacci (common choice)
export const MODIFIED_FIBONACCI_DECK: Card[] = [
  { value: '0', label: '0', numericValue: 0 },
  { value: '½', label: '½', numericValue: 0.5 },
  { value: '1', label: '1', numericValue: 1 },
  { value: '2', label: '2', numericValue: 2 },
  { value: '3', label: '3', numericValue: 3 },
  { value: '5', label: '5', numericValue: 5 },
  { value: '8', label: '8', numericValue: 8 },
  { value: '13', label: '13', numericValue: 13 },
  { value: '21', label: '21', numericValue: 21 },
  { value: '?', label: '?', numericValue: null },
  { value: '☕', label: '☕', numericValue: null },
]

export function usePokerDeck(deckType: 'fibonacci' | 'modified' = 'modified') {
  const deck = computed(() => 
    deckType === 'fibonacci' ? FIBONACCI_DECK : MODIFIED_FIBONACCI_DECK
  )

  const getCard = (value: CardValue): Card | undefined => {
    return deck.value.find(card => card.value === value)
  }

  const getNumericValue = (value: CardValue): number | null => {
    const card = getCard(value)
    return card?.numericValue ?? null
  }

  const isNumericCard = (value: CardValue): boolean => {
    return getNumericValue(value) !== null
  }

  return {
    deck,
    getCard,
    getNumericValue,
    isNumericCard,
  }
}
