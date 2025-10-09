// Centralized constants for messages, API paths and model names
export const ERRORS = {
  AMOUNT_REQUIRED: 'amount is required',
  HOLIDAY_WEEKOFF: 'Cannot create booking on a holiday or weekoff',
  INVALID_BOOKING_ID: 'Invalid booking id',
  BOOKING_NOT_FOUND: 'Booking not found',
  TOKEN_REQUIRED: 'tokenNumber is required',
  TOKEN_NOT_FOUND: 'Booking with this token number not found',
  DATES_REQUIRED: 'Both fromDate and toDate are required',
  INVALID_DATE_FORMAT: 'Invalid date format. Provide valid date strings',
  NO_BOOKINGS_IN_RANGE: 'No bookings found within the specified date range',
  INTERNAL: 'Internal Server Error'
};

export const MESSAGES = {
  USER_CREATED: 'User created successfully',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  FAILED_CREATE_USER: 'Failed to create user',
  LOGIN_SUCCESS: 'Login successful',
  EMAIL_REQUIRED: 'Email is required',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Email or password is invalid',
  PASSWORD_UPDATED: 'Password updated successfully',
  FAILED_UPDATE_PASSWORD: 'Failed to update password',
  HOLIDAY_ADDED: 'Holiday added successfully',
  FAILED_CREATE_HOLIDAY: 'Failed to create holiday',
  WEEKOFF_CREATED: 'Week off created successfully',
  FAILED_FETCH_SLOTS: 'Failed to fetch slots',
  NAME_REQUIRED: 'Holiday name is required',
  DATE_REQUIRED: 'Date is required for holiday',
  INVALID_HOLIDAY_DATE: 'Holiday date cannot be in the past or today',
  CANNOT_ADD_HOLIDAY_ON_WEEKOFF: 'Cannot add holiday on a weekly off day',
  HOLIDAY_ALREADY_EXISTS: 'A holiday already exists on this date',
  FAILED_FETCH_HOLIDAYS: 'Failed to fetch holidays',
  HOLIDAY_NOT_FOUND: 'Holiday not found',
  FAILED_UPDATE_HOLIDAY: 'Failed to update holiday',
  HOLIDAY_UPDATED: 'Holiday updated successfully',
  CANNOT_DELETE_PAST_HOLIDAY: 'Cannot delete a holiday in the past',
  CANNOT_ADD_HOLIDAY_ON_BOOKING:"Cannot add holiday on a date with existing bookings",
  FAILED_DELETE_HOLIDAY: 'Failed to delete holiday',
  HOLIDAY_DELETED: 'Holiday deleted successfully',
  ALL_FIELDS_REQUIRED: 'All fields are required',
  FAILED_FETCH_USERS: 'Failed to fetch users',
  EMAIL_AND_NEW_PASSWORD_REQUIRED: 'Email and new password are required',
  FAILED_CREATE_WEEKOFF: 'Failed to create week off',
  FAILED_FETCH_WEEKOFFS: 'Failed to fetch weekoffs',
  WEEKDAY_VALIDATION_FAILED: "Weekday must be between 0 (Sunday) and 6 (Saturday)" ,
  WEEK_VALIDATION_FAILED: "Weeks must be an array of numbers between 0 and 5" ,
  VALID_FROM_TO_REQUIRED: 'validFrom and validTo are required for non-recurring week off',
  VALID_FROM_AFTER_VALID_TO: 'validFrom cannot be after validTo',
  FAILED_UPDATE_WEEKOFF: 'Failed to update weekoff',
  WEEKOFF_UPDATED: 'Weekoff updated successfully',
  WEEKOFF_NOT_FOUND: 'Weekoff not found',
  WEEKOFF_DELETED: 'Weekoff deleted successfully',
  FAILED_DELETE_WEEKOFF: 'Failed to delete Weekoff ',
  UNAUTHORIZED: 'Unauthorized',
  INVALID_TOKEN: 'Invalid token',
  NOT_FOUND_ROUTE: 'No API found for this route',

  SLOT_UPDATED_SUCCESS: " Slot updated successfully",
  FAILED_UPDATE_SLOTS: 'Failed to update slots',
  SLOT_SIZE_REQUIRED: 'slotSize is required',
  SLOTS_NOT_FOUND: 'No active slots found'
};

export const API_PATHS = {
  BOOKING: {
    ROOT: '/api/booking',
    TOKEN: '/token/:tokenNumber',
    RANGE: '/range',
    ID: '/:id',
    ADMIN_APPOINTMENTS: '/admin/appointments'
  }
};

export const MODEL_NAMES = {
  BOOKING: 'Booking',
  USER: 'User'
};

export default { ERRORS, API_PATHS, MODEL_NAMES };
