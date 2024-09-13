import React from "react";

const TestPage = () => {
  const token = localStorage.getItem("access_token");
  if (token) {
    console.log("Токен найден:", token);
  } else {
    console.log("Токен не найден");
  }

  return <div>TestPage</div>;
};

export default TestPage;
