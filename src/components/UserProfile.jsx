import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { WishlistContext } from "../context/WishlistContext.jsx";
import { useTranslation } from "react-i18next";
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  useMediaQuery,
  keyframes,
} from "@mui/material";
import { styled, useTheme } from "@mui/system";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Animation keyframes
const slideIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const ProfileContainer = styled(Box)(({ theme }) => ({
  maxWidth: 1000,
  margin: "auto",
  padding: theme.spacing(2),
  backgroundColor: "#f7f7f7",
  borderRadius: "12px",
  minHeight: "80vh",
  animation: `${slideIn} 0.5s ease-out`,
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(1) },
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  backgroundColor: "#fff",
  padding: theme.spacing(3),
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
  },
  [theme.breakpoints.down("sm")]: { padding: theme.spacing(2) },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "8px",
  fontWeight: 600,
  padding: theme.spacing(1, 2),
  "&:hover": {
    transform: "scale(1.05)",
    transition: "background-color 0.2s, transform 0.2s",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(0.5, 1),
    fontSize: "0.75rem",
    width: "100%",
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#fff",
    "& fieldset": { borderColor: "#ccc" },
    "&:hover fieldset": { borderColor: "#999" },
    "&.Mui-focused fieldset": { borderColor: "#f0c14b" },
  },
  "& .MuiInputLabel-root": { color: "#555" },
  "& .MuiInputLabel-root.Mui-focused": { color: "#f0c14b" },
}));

function UserProfile() {
  const { user, updateUser, logout } = useContext(AuthContext);
  const { wishlist } = useContext(WishlistContext);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProfile(), fetchOrders(), fetchActivities()]);
      } catch (error) {
        setError(t("Failed to load profile data"));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, navigate, t]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/users/profile",
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProfile(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        password: "",
      });
    } catch (error) {
      throw new Error(t("Failed to load profile"));
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/orders/my-orders",
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setOrders(response.data);
    } catch (error) {
      throw new Error(t("Failed to fetch orders"));
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get(
        "https://eshop-backend-e11f.onrender.com/api/activities/me",
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setActivities(response.data);
    } catch (error) {
      throw new Error(t("Failed to load recent activities"));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateUser(formData);
      setSuccess(t("Profile updated successfully"));
      setError("");
      setTimeout(() => setSuccess(""), 3000);
      await fetchProfile();
    } catch (error) {
      setError(error.response?.data.message || t("Failed to update profile"));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete(
        "https://eshop-backend-e11f.onrender.com/api/users/me",
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      logout();
      navigate("/");
    } catch (error) {
      setError(
        t("Failed to delete account") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  const handleShareReferral = () => {
    const referralLink = `${window.location.origin}/register?ref=${profile.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setSuccess(t("Referral link copied to clipboard!"));
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleApplyReferralDiscount = async () => {
    try {
      const response = await axios.put(
        "https://eshop-backend-e11f.onrender.com/api/users/apply-referral-discount",
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setProfile({ ...profile, referralDiscount: 0 });
      setSuccess(
        t(`Applied ${response.data.discount}% discount to your next order!`)
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(
        t("Failed to apply discount") +
          ": " +
          (error.response?.data.message || error.message)
      );
    }
  };

  if (loading) {
    return (
      <ProfileContainer>
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress
            sx={{ color: "#f0c14b" }}
            size={isMobile ? 30 : 40}
          />
        </Box>
      </ProfileContainer>
    );
  }

  return (
    <ProfileContainer>
      <Typography
        variant={isMobile ? "h5" : "h4"}
        sx={{
          color: "#111",
          fontWeight: 700,
          textAlign: "center",
          mb: isMobile ? 2 : 4,
        }}
      >
        {t("Your Dashboard")}
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 2, bgcolor: "#ffebee" }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2, borderRadius: 2, bgcolor: "#e0f7fa" }}
        >
          {success}
        </Alert>
      )}

      <Grid container spacing={isMobile ? 2 : 4}>
        <Grid item xs={12} md={6}>
          <ProfileCard>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ color: "#111", fontWeight: 600, mb: 2 }}
              >
                {t("Update Profile")}
              </Typography>
              <StyledTextField
                label={t("Name")}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <StyledTextField
                label={t("Email")}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <StyledTextField
                label={t("New Password")}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
              />
              <Box
                sx={{
                  mt: 3,
                  display: "flex",
                  gap: isMobile ? 1 : 2,
                  flexDirection: isMobile ? "column" : "row",
                }}
              >
                <ActionButton
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{ bgcolor: "#f0c14b", "&:hover": { bgcolor: "#e0b03a" } }}
                >
                  {t("Update")}
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  onClick={logout}
                  sx={{
                    color: "#e74c3c",
                    borderColor: "#e74c3c",
                    "&:hover": { color: "#c0392b", borderColor: "#c0392b" },
                  }}
                >
                  {t("Logout")}
                </ActionButton>
                <ActionButton
                  variant="outlined"
                  onClick={() => setConfirmDelete(true)}
                  sx={{
                    color: "#e74c3c",
                    borderColor: "#e74c3c",
                    "&:hover": { color: "#c0392b", borderColor: "#c0392b" },
                  }}
                >
                  {t("Delete Account")}
                </ActionButton>
              </Box>

              <Dialog
                open={confirmDelete}
                onClose={() => setConfirmDelete(false)}
              >
                <DialogTitle sx={{ bgcolor: "#f7f7f7", color: "#111" }}>
                  {t("Confirm Account Deletion")}
                </DialogTitle>
                <DialogContent>
                  <Typography sx={{ color: "#555" }}>
                    {t(
                      "Are you sure you want to delete your account? This action cannot be undone."
                    )}
                  </Typography>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setConfirmDelete(false)}
                    sx={{ color: "#555" }}
                  >
                    {t("Cancel")}
                  </Button>
                  <ActionButton
                    variant="contained"
                    onClick={handleDeleteAccount}
                    sx={{
                      bgcolor: "#e74c3c",
                      "&:hover": { bgcolor: "#c0392b" },
                    }}
                  >
                    {t("Delete")}
                  </ActionButton>
                </DialogActions>
              </Dialog>
            </CardContent>
          </ProfileCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ProfileCard>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ color: "#111", fontWeight: 600, mb: 2 }}
              >
                {t("Your Stats")}
              </Typography>
              <Typography sx={{ color: "#555", mb: 1 }}>
                <strong>{t("Total Orders")}:</strong> {orders.length}
              </Typography>
              <Typography sx={{ color: "#555", mb: 1 }}>
                <strong>{t("Wishlist Items")}:</strong> {wishlist.length}
              </Typography>
              <Typography sx={{ color: "#555" }}>
                <strong>{t("Recent Activity")}:</strong> {activities.length}{" "}
                {t("events")}
              </Typography>
            </CardContent>
          </ProfileCard>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: isMobile ? 2 : 4, bgcolor: "#e0e0e0" }} />
          <Typography
            variant="h6"
            sx={{ color: "#111", fontWeight: 600, mb: 3 }}
          >
            {t("Referral Program")}
          </Typography>
          <ProfileCard>
            <CardContent>
              {profile && (
                <>
                  <Typography sx={{ color: "#111", mb: 2 }}>
                    {t("Your Referral Code")}:{" "}
                    <strong>{profile.referralCode}</strong>
                  </Typography>
                  <Typography sx={{ color: "#555", mb: 2 }}>
                    {t(
                      "Share this code with friends to earn a 10% discount on your next purchase when they order!"
                    )}
                  </Typography>
                  <ActionButton
                    variant="contained"
                    onClick={handleShareReferral}
                    sx={{
                      bgcolor: "#2ecc71",
                      "&:hover": { bgcolor: "#27ae60" },
                    }}
                  >
                    {t("Copy Referral Link")}
                  </ActionButton>
                  <Typography sx={{ color: "#111", mt: 2, mb: 1 }}>
                    {t("Referral Discount Available")}:{" "}
                    {profile.referralDiscount}%
                  </Typography>
                  <ActionButton
                    variant="contained"
                    onClick={handleApplyReferralDiscount}
                    disabled={profile.referralDiscount <= 0}
                    sx={{
                      bgcolor: "#3498db",
                      "&:hover": { bgcolor: "#2980b9" },
                      mt: 2,
                    }}
                  >
                    {t("Apply Referral Discount")}
                  </ActionButton>
                  <Typography variant="h6" sx={{ color: "#111", mt: 3, mb: 2 }}>
                    {t("Referred Friends")}
                  </Typography>
                  {profile.referredUsers.length === 0 ? (
                    <Typography sx={{ color: "#555" }}>
                      {t("No referrals yet.")}
                    </Typography>
                  ) : (
                    <List>
                      {profile.referredUsers.map((referred) => (
                        <ListItem key={referred._id} sx={{ py: 1 }}>
                          <ListItemText
                            primary={referred.name}
                            secondary={referred.email}
                            primaryTypographyProps={{ color: "#111" }}
                            secondaryTypographyProps={{ color: "#555" }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </>
              )}
            </CardContent>
          </ProfileCard>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: isMobile ? 2 : 4, bgcolor: "#e0e0e0" }} />
          <Typography
            variant="h6"
            sx={{ color: "#111", fontWeight: 600, mb: 3 }}
          >
            {t("Recent Activity")}
          </Typography>
          <List>
            {activities.length === 0 ? (
              <Typography sx={{ color: "#555", textAlign: "center" }}>
                {t("No recent activity.")}
              </Typography>
            ) : (
              activities.map((activity) => (
                <ListItem
                  key={activity._id}
                  sx={{
                    py: isMobile ? 1 : 2,
                    borderRadius: "12px",
                    mb: 1,
                    bgcolor: "#f9fafb",
                    "&:hover": { bgcolor: "#f0f4f8" },
                    flexDirection: isMobile ? "column" : "row",
                    alignItems: isMobile ? "flex-start" : "center",
                  }}
                >
                  <ListItemText
                    primary={t(activity.action)}
                    secondary={`${activity.details} - ${new Date(
                      activity.timestamp
                    ).toLocaleString()}`}
                    primaryTypographyProps={{ fontWeight: 500, color: "#111" }}
                    secondaryTypographyProps={{
                      color: "#555",
                      mt: isMobile ? 1 : 0,
                    }}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Grid>
      </Grid>
    </ProfileContainer>
  );
}

export default UserProfile;
