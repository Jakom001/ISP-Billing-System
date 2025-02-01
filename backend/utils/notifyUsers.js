const cron = require("node-cron");
const User = require("../models/userModel");
const { sendEmailNotification, sendSMSNotification } = require("../utils/notification");

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const notifyUsers = async () => {
  const subject = "Internet Subscription Expiry Reminder";
  try {
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Create date objects for start and end of today
    const startOfToday = new Date(today);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    // Create date objects for 2 days from now
    const startOfTwoDays = new Date(today);
    startOfTwoDays.setDate(today.getDate() + 2);
    startOfTwoDays.setHours(0, 0, 0, 0);
    
    const endOfTwoDays = new Date(startOfTwoDays);
    endOfTwoDays.setHours(23, 59, 59, 999);

    // Create date objects for 5 days from now
    const startOfFiveDays = new Date(today);
    startOfFiveDays.setDate(today.getDate() + 5);
    startOfFiveDays.setHours(0, 0, 0, 0);
    
    const endOfFiveDays = new Date(startOfFiveDays);
    endOfFiveDays.setHours(23, 59, 59, 999);

   

    // Find users whose expiry date matches any of our notification periods
    const users = await User.find({
      $or: [
        {
          // Today
          connectionExpiryDate: {
            $gte: startOfToday,
            $lte: endOfToday
          }
        },
        {
          // 2 days from now
          connectionExpiryDate: {
            $gte: startOfTwoDays,
            $lte: endOfTwoDays
          }
        },
        {
          // 5 days from now
          connectionExpiryDate: {
            $gte: startOfFiveDays,
            $lte: endOfFiveDays
          }
        }
      ]
    }).populate({
      path: "package",
      select: "packageName price"
    });

    console.log(`Found ${users.length} users to process`);

    for (const user of users) {
      const packagePrice = user.package.price;

      // Only proceed if user has insufficient balance
      if (user.balance < packagePrice) {
        const expiryDate = new Date(user.connectionExpiryDate);
        expiryDate.setHours(0, 0, 0, 0); // Normalize expiry date to the start of the day

        const daysRemaining = (expiryDate - today) / (1000 * 60 * 60 * 24); // Get the difference in days


        console.log(`Processing user ${user.username} with expiry in ${daysRemaining} days`);

        // Capitalize the first name
        const capitalizedFirstName = capitalizeFirstLetter(user.firstName);

        // Construct the expiry message based on days remaining
        const expiryText = daysRemaining === 0 
          ? `expires today ${user.connectionExpiryDate.toDateString()}`
          : `expires in ${daysRemaining} days on ${user.connectionExpiryDate.toDateString()}`;

        const message = `Dear ${capitalizedFirstName}, </br> Your ${
          user.package.packageName
        } internet package subscription ${expiryText} at 11:59pm. Please top up Ksh ${
          user.package.price - user.balance
        } to till number ${process.env.TillNumber}. Thank you.`;

        // Avoid duplicate notifications
        if (!user.lastReminderSent || new Date(user.lastReminderSent).toDateString() !== today.toDateString()) {
          try {
            let notificationSent = false;

            // Send Email if available
            if (user.email) {
              try {
                await sendEmailNotification(user.email, subject, message);
                notificationSent = true;
                console.log(`Email sent successfully to ${user.email}`);
              } catch (emailError) {
                console.error(`Failed to send email to ${user.email}:`, emailError.message);
              }
            } else {
              console.log(`${user.username} has no email, skipping email notification.`);
            }

            // Only update lastReminderSent if at least one notification was sent successfully
            if (notificationSent) {
              user.lastReminderSent = today;
              await user.save();
              console.log(`Updated lastReminderSent for user ${user.username}. Days remaining: ${daysRemaining}`);
            } else {
              console.log(`No notifications were sent successfully for user ${user.username}`);
            }
          } catch (notificationError) {
            console.error(`Error processing notifications for user ${user.username}:`, notificationError.message);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error sending notifications:", error.message);
  }
};

// Schedule job to run daily at 8 AM
const notificationJob = cron.schedule(
  "42 16 * * *",
  async () => {
    try {
      console.log("Running notification job...");
      await notifyUsers();
      console.log("Notification job completed");
    } catch (error) {
      console.error("Error in notification job:", error);
    }
  },
  {
    scheduled: true,
    timezone: "Africa/Nairobi",
  }
);

module.exports = { notificationJob };