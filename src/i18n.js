import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        "Return Request": "Return Request",
        "Reason for Return": "Reason for Return",
        "Submit Return Request": "Submit Return Request",
        "Returns available only for delivered orders":
          "Returns available only for delivered orders",
        Returns: "Returns",
        "Pending Return Requests": "Pending Return Requests",
        Reason: "Reason",
        Status: "Status",
        Approve: "Approve",
        Reject: "Reject",
        "Return request approved successfully":
          "Return request approved successfully",
        "Return request rejected successfully":
          "Return request rejected successfully",
        "Failed to load return requests": "Failed to load return requests",
        "Failed to update return request": "Failed to update return request",
        "Sales by Category": "Sales by Category",
        "User Activity Heatmap (Last 30 Days)":
          "User Activity Heatmap (Last 30 Days)",
        "Daily Activity": "Daily Activity",
        "Failed to load sales by category": "Failed to load sales by category",
        "Failed to load heatmap data": "Failed to load heatmap data",
        Bundles: "Bundles",
        "Add New Bundle": "Add New Bundle",
        "Edit Bundle": "Edit Bundle",
        "Bundle List": "Bundle List",
        Discount: "Discount",
        Price: "Price",
        "Bundle added successfully": "Bundle added successfully",
        "Bundle updated successfully": "Bundle updated successfully",
        "Bundle deleted successfully": "Bundle deleted successfully",
        "Failed to load bundles": "Failed to load bundles",
        "Failed to add bundle": "Failed to add bundle",
        "Failed to update bundle": "Failed to update bundle",
        "Failed to delete bundle": "Failed to delete bundle",
        "Referral Program": "Referral Program",
        "Your Referral Code": "Your Referral Code",
        "Share this code with friends to earn a 10% discount on your next purchase when they order!":
          "Share this code with friends to earn a 10% discount on your next purchase when they order!",
        "Copy Referral Link": "Copy Referral Link",
        "Referral Discount Available": "Referral Discount Available",
        "Referred Friends": "Referred Friends",
        "No referrals yet": "No referrals yet",
        "Referral Code": "Referral Code",
        Referrals: "Referrals",
        "Referral List": "Referral List",
        Code: "Code",
        "Failed to load referrals": "Failed to load referrals",
        "Referral link copied to clipboard!":
          "Referral link copied to clipboard!",
      },
      am: {
        "Return Request": "የመመለሻ ጥያቄ",
        "Reason for Return": "የመመለሻ ምክንያት",
        "Submit Return Request": "የመመለሻ ጥያቄ አስፈልግ",
        "Returns available only for delivered orders":
          "መመለሻ ለተላኩ ትዕዛዞች ብቻ ይገኛል",
        Returns: "መመለሻዎች",
        "Pending Return Requests": "በመጠባበቅ ላይ ያሉ የመመለሻ ጥያቄዎች",
        Reason: "ምክንያት",
        Status: "ሁኔታ",
        Approve: "ፍቀድ",
        Reject: "እምቢ",
        "Return request approved successfully": "የመመለሻ ጥያቄ ተፈቅዷል",
        "Return request rejected successfully": "የመመለሻ ጥያቄ ተከልክሏል",
        "Failed to load return requests": "የመመለሻ ጥያቄዎችን መጫን አልተሳካም",
        "Failed to update return request": "የመመለሻ ጥያቄን ማዘመን አልተሳካም",
        "Sales by Category": "ሽያጭ በምድብ",
        "User Activity Heatmap (Last 30 Days)":
          "የተጠቃሚ እንቅስቃሴ ሙቀት ካርታ (የመጨረሻ 30 ቀናት)",
        "Daily Activity": "ዕለታዊ እንቅስቃሴ",
        "Failed to load sales by category": "ሽያጭን በምድብ መጫን አልተሳካም",
        "Failed to load heatmap data": "ሙቀት ካርታ ውሂብ መጫን አልተሳካም",
        Bundles: "ጥቅል ምርቶች",
        "Add New Bundle": "አዲስ ጥቅል ያክሉ",
        "Edit Bundle": "ጥቅል አርትዕ",
        "Bundle List": "የጥቅል ዝርዝር",
        Discount: "ቅናሽ",
        Price: "ዋጋ",
        "Bundle added successfully": "ጥቅል ተጨምሯል",
        "Bundle updated successfully": "ጥቅል ዘምኗል",
        "Bundle deleted successfully": "ጥቅል ተሰርዟል",
        "Failed to load bundles": "ጥቅሎችን መጫን አልተሳካም",
        "Failed to add bundle": "ጥቅል መጨመር አልተሳካም",
        "Failed to update bundle": "ጥቅል መዘመን አልተሳካም",
        "Failed to delete bundle": "ጥቅል መሰረዝ አልተሳካም",
        "Referral Program": "የሪፈራል ፕሮግራም",
        "Your Referral Code": "የእርስዎ ሪፈራል ኮድ",
        "Share this code with friends to earn a 10% discount on your next purchase when they order!":
          "ይህን ኮድ ከጓደኞች ጋር ያካፍሉ እና ትዕዛዝ ሲያደርጉ 10% ቅናሽ ያግኙ!",
        "Copy Referral Link": "ሪፈራል አገናኝ ቅዳ",
        "Referral Discount Available": "የሪፈራል ቅናሽ ይገኛል",
        "Referred Friends": "የተጠቆሙ ጓደኞች",
        "No referrals yet": "እስካሁን ምንም ሪፈራሎች የሉም",
        "Referral Code": "ሪፈራል ኮድ",
        Referrals: "ሪፈራሎች",
        "Referral List": "የሪፈራል ዝርዝር",
        Code: "ኮድ",
        "Failed to load referrals": "ሪፈራሎችን መጫን አልተሳካም",
        "Referral link copied to clipboard!": "ሪፈራል አገናኝ ወደ ክሊፕቦርድ ተቀድቷል!",
      },
    },
    fallbackLng: "en",
    detection: {
      order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],
      caches: ["localStorage", "cookie"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
