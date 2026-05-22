export const demoUsers = [
  {
    username: "admin",
    email: "admin@demo.local",
    password: "admin123",
    phone: "0901234567",
    fullName: "Smart Home Admin"
  },
  {
    username: "khanh",
    email: "khanh@demo.local",
    password: "khanh123",
    phone: "0912345678",
    fullName: "Khanh Demo"
  }
];

export const updateDemoUserPassword = (username, nextPassword) => {
  const user = demoUsers.find((item) => item.username === username);

  if (!user) {
    return null;
  }

  user.password = nextPassword;
  return user;
};
