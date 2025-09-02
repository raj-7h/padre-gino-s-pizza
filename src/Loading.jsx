import "./LoadingPage.css";

const LoadingPage = () => {
  return (
    <div className="loading-container">
      <div className="pizza-loader">
        <div className="slice slice1"></div>
        <div className="slice slice2"></div>
        <div className="slice slice3"></div>
        <div className="slice slice4"></div>
        <div className="slice slice5"></div>
        <div className="slice slice6"></div>
      </div>
      <h2>Cooking your pizzas...</h2>
    </div>
  );
};

export default LoadingPage;
