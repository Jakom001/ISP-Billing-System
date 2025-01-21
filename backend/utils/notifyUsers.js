const cron = require("node-cron");
const User = require("../models/userModel");
const { sendEmailNotification, sendSMSNotification } = require("../utils/notification");

// Helper function to capitalize first letter
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const notifyUsers = async () => {
  const subject = "Wifi Subscription Expiry Reminder";
  try {
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get date 5 days from now (end of day)
    const fiveDaysFromNow = new Date(today);
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    fiveDaysFromNow.setHours(23, 59, 59, 999);

    // Find users whose expiry date is either today or exactly 5 days from now
    const users = await User.find({
      $or: [
        {
          connectionExpiryDate: {
            $gte: today,
            $lte: new Date(today.setHours(23, 59, 59, 999))
          }
        },
        {
          connectionExpiryDate: {
            $gte: new Date(fiveDaysFromNow.setHours(0, 0, 0, 0)),
            $lte: fiveDaysFromNow
          }
        }
      ]
    }).populate({
      path: "package",
      select: "packageName price"
    });
    for (const user of users) {
      const packagePrice = user.package.price;

      // Only proceed if user has insufficient balance
      if (user.balance < packagePrice) {
        const daysRemaining = Math.ceil(
          (new Date(user.connectionExpiryDate) - today) / (1000 * 60 * 60 * 24)
        );

        // Capitalize the first name
        const capitalizedFirstName = capitalizeFirstLetter(user.firstName);

        // Construct the expiry message based on whether it expires today or in 5 days
        const expiryText = daysRemaining === 0 
          ? "expires today"
          : `expires in ${daysRemaining} days on ${user.connectionExpiryDate.toDateString()}`;

        const message = `Dear ${capitalizedFirstName}, your ${
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
              } catch (emailError) {
                console.error(`Failed to send email to ${user.email}:`, emailError.message);
                // Don't set notificationSent to true if email fails
              }
            } else {
              console.log(`${user.username} has no email, skipping email notification.`);
            }

            // Send SMS (when implemented)
            // try {
            //   await sendSMSNotification(user, message);
            //   notificationSent = true;
            // } catch (smsError) {
            //   console.error(`Failed to send SMS to ${user.phone}:`, smsError.message);
            // }

            // Only update lastReminderSent if at least one notification was sent successfully
            if (notificationSent) {
              user.lastReminderSent = today;
              await user.save();
              console.log(`Updated lastReminderSent for user ${user.username}`);
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
  "53 13 * * *",
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