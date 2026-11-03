/**
 * MediRoutine AI - Smart Medicine Verification Engine
 * Implements the 7-step verification workflow and status evaluator:
 * 
 * Step 1: Reminder activates at scheduled time
 * Step 2: ESP32 activates buzzer & LED
 * Step 3: Servo motor opens assigned compartment
 * Step 4: Reed Switch detects compartment opening
 * Step 5: Load Cell + HX711 checks whether medicine weight decreased
 * Step 6: User presses push button to acknowledge
 * Step 7: Backend evaluates events and assigns verified status
 *
 * Statuses:
 * - 'Removal Detected + User Confirmed' (Weight lost >= threshold AND button pressed)
 * - 'Removal Detected – Unconfirmed'   (Weight lost >= threshold, but NO button pressed)
 * - 'Unverified Confirmation'          (Button pressed, but weight did NOT drop)
 * - 'Missed / Not Confirmed'           (Neither removal nor confirmation before timeout)
 * - 'Compartment Opened'               (Currently opened, awaiting removal or button)
 * - 'Reminder Active'                  (Buzzer/LED buzzing, awaiting user interaction)
 * - 'Upcoming'                         (Scheduled for future time)
 */

function evaluateDoseEvent({
  scheduledWeight,
  weightBefore,
  weightAfter,
  reedSwitchOpened,
  buttonPressed,
  timeTakenSeconds,
  timeoutExpired = false
}) {
  const threshold = 0.15; // Minimum 0.15g loss to detect pill removal
  const weightDelta = (weightBefore !== null && weightAfter !== null) 
    ? Number((weightBefore - weightAfter).toFixed(2)) 
    : 0;
  
  const weightDecreased = weightDelta >= threshold;

  // Decision matrix
  if (weightDecreased && buttonPressed) {
    return {
      status: 'Removal Detected + User Confirmed',
      verified: true,
      weightDeltaGrams: weightDelta,
      description: `Sensor verified: ${weightDelta}g medicine removed and button confirmed within ${timeTakenSeconds || 15}s.`,
      severity: 'success'
    };
  }

  if (weightDecreased && !buttonPressed && timeoutExpired) {
    return {
      status: 'Removal Detected – Unconfirmed',
      verified: false,
      weightDeltaGrams: weightDelta,
      description: `Sensor verified: ${weightDelta}g medicine removed, but user failed to press the confirmation button before timeout.`,
      severity: 'warning'
    };
  }

  if (!weightDecreased && buttonPressed) {
    return {
      status: 'Unverified Confirmation',
      verified: false,
      weightDeltaGrams: weightDelta,
      description: `ALERT: User pressed confirmation button, but HX711 scale detected 0.00g weight loss. Compartment was not emptied. Potential missed ingestion!`,
      severity: 'danger'
    };
  }

  if (timeoutExpired && !weightDecreased && !buttonPressed) {
    return {
      status: 'Missed / Not Confirmed',
      verified: false,
      weightDeltaGrams: 0,
      description: 'Dose window expired without compartment opening, weight change, or button acknowledgment.',
      severity: 'danger'
    };
  }

  if (reedSwitchOpened && !buttonPressed && !timeoutExpired) {
    return {
      status: 'Compartment Opened',
      verified: false,
      weightDeltaGrams: weightDelta,
      description: 'Compartment is currently open. Awaiting medicine removal and button acknowledgment.',
      severity: 'info'
    };
  }

  return {
    status: 'Reminder Active',
    verified: false,
    weightDeltaGrams: 0,
    description: 'Buzzer and LED active. Awaiting patient interaction.',
    severity: 'info'
  };
}

module.exports = {
  evaluateDoseEvent
};
