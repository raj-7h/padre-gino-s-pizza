import { use } from "react";
import { CartContext } from "./Contexts";
import { Link } from "@tanstack/react-router";
export default function Header() {
  const [cart] = use(CartContext);
  return (
    <nav>
      <Link to="/">
        <h1 className="logo">Padre Gino's Pizza</h1>
      </Link>
      <div className="nav-cart">
        🛒<span className="nav-cart-number">{cart.length}</span>
      </div>
    </nav>
  );
}
