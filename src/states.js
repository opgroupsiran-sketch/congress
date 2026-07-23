/**
 * State Machine
 * 
 * Defines all valid states and allowed transitions.
 * Prevents invalid state combinations.
 * Single source of truth for conversation flow.
 */

export const STATES = {
  START: 'START',
  GET_NAME: 'GET_NAME',
  GET_NATIONAL_ID: 'GET_NATIONAL_ID',
  GET_FIELD: 'GET_FIELD',
  GET_LEVEL: 'GET_LEVEL',
  GET_PHONE: 'GET_PHONE',
  GET_DOCUMENT: 'GET_DOCUMENT',
  WAIT_OPERATOR_DOCUMENT: 'WAIT_OPERATOR_DOCUMENT',
  GET_PAYMENT_RECEIPT: 'GET_PAYMENT_RECEIPT',
  WAIT_OPERATOR_PAYMENT: 'WAIT_OPERATOR_PAYMENT',
  REGISTRATION_COMPLETE: 'REGISTRATION_COMPLETE',
};

/**
 * State transition graph
 * Ensures only valid transitions occur
 */
export const STATE_TRANSITIONS = {
  [STATES.START]: [STATES.GET_NAME],
  [STATES.GET_NAME]: [STATES.GET_NATIONAL_ID],
  [STATES.GET_NATIONAL_ID]: [STATES.GET_FIELD],
  [STATES.GET_FIELD]: [STATES.GET_LEVEL],
  [STATES.GET_LEVEL]: [STATES.GET_PHONE],
  [STATES.GET_PHONE]: [STATES.GET_DOCUMENT],
  [STATES.GET_DOCUMENT]: [STATES.WAIT_OPERATOR_DOCUMENT, STATES.GET_DOCUMENT],
  [STATES.WAIT_OPERATOR_DOCUMENT]: [STATES.GET_DOCUMENT, STATES.GET_PAYMENT_RECEIPT],
  [STATES.GET_PAYMENT_RECEIPT]: [STATES.WAIT_OPERATOR_PAYMENT, STATES.GET_PAYMENT_RECEIPT],
  [STATES.WAIT_OPERATOR_PAYMENT]: [STATES.GET_PAYMENT_RECEIPT, STATES.REGISTRATION_COMPLETE],
  [STATES.REGISTRATION_COMPLETE]: [],
};

/**
 * Validates if transition is allowed
 * @param {string} currentState
 * @param {string} nextState
 * @returns {boolean}
 */
export function isValidTransition(currentState, nextState) {
  const allowedTransitions = STATE_TRANSITIONS[currentState];
  return allowedTransitions && allowedTransitions.includes(nextState);
}

/**
 * Gets next state in sequence
 * Prevents skipping states
 */
export function getNextStateInSequence(currentState) {
  const stateSequence = [
    STATES.START,
    STATES.GET_NAME,
    STATES.GET_NATIONAL_ID,
    STATES.GET_FIELD,
    STATES.GET_LEVEL,
    STATES.GET_PHONE,
    STATES.GET_DOCUMENT,
  ];

  const currentIndex = stateSequence.indexOf(currentState);
  if (currentIndex === -1 || currentIndex === stateSequence.length - 1) {
    return null;
  }

  return stateSequence[currentIndex + 1];
}

export default {
  STATES,
  STATE_TRANSITIONS,
  isValidTransition,
  getNextStateInSequence,
};