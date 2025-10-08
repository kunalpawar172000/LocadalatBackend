import { Weekoff } from "../models/weekoffModel.js";
import { Holiday } from "../models/holidayModel.js";
import { getWeekOfMonth } from "date-fns"

// utils/validateBody.js
export const validateBodyParams = async (req, res, requiredParams) => {
    const missing = requiredParams.filter(param => !(param in req.body));
    if (missing.length > 0) {
        return res.status(400).json({
            isSuccess: false,
            message: `Missing parameter(s): ${missing.join(", ")}`
        });
    }
    return null; // all parameters exist
};

// export const checkIsDayWeekOff = async (date) => {
//     const dateObj = new Date(date);
//     const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
//     const weekOfMonth = getWeekOfMonth(dateObj); // 1 to 5

//     const checkHasWeekOff = await Weekoff.find({ dayOfWeek: dayOfWeek, active: true });
//     if (checkHasWeekOff) {
//         const validFrom = new Date(checkHasWeekOff.validFrom);
//         const validTo = new Date(checkHasWeekOff.validTo);

//         // Case: every week off
//         if (checkHasWeekOff.everyWeek) {
//             if (checkHasWeekOff.recurring) {
//                 return true;
//             } else if (dateObj >= validFrom && dateObj <= validTo) {
//                 return true;
//             }
//         }

//         // Case: recurring weekly off with specific weeks of month
//         else if (checkHasWeekOff.recurring && checkHasWeekOff.weeksOfMonth?.includes(weekOfMonth)) {
//             return true;
//         }

//         // Case: non-recurring week off with specific weeks of month
//         else if (!checkHasWeekOff.recurring && dateObj >= validFrom && dateObj <= validTo && checkHasWeekOff.weeksOfMonth?.includes(weekOfMonth)) {
//             return true;
//         }
//     }

//     // Not a week off
//     return false;
// };

export const checkIsDayWeekOff = async (date) => {
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();  // 0 = Sunday, 6 = Saturday
    const weekOfMonth = getWeekOfMonth(dateObj); // 1-5

    // Query only required fields
    const weekoff = await Weekoff.find(
        { weekday: dayOfWeek, isActive: true },
        { weeks: 1 }   // fetch only "weeks" field
    );

    // Return true only if weekoff exists and matches current week
    return weekoff?.weeks?.includes(weekOfMonth) || false;
};

export const checkIsDayHoliday = async (date) => {
    const isHolidayExist = await Holiday.findOne({ date: new Date(date), isActive: true });
    if (!isHolidayExist) return false
    return true;
}

export const isHolidayExistInDb = async (id) => {
    const isHolidayExist = await Holiday.findById(id);
    if (!isHolidayExist) return false
    return true;
}

