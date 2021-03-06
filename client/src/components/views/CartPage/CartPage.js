import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import {
  getCartItems,
  removeCartItem,
  onSuccessBuy,
} from "../../../_actions/user_actions";
import UserCardBlock from "./Sections/UserCardBlock";
import { Empty, Result } from "antd";
import Paypal from "../../utils/Paypal";
import styles from "./CartPage.module.css";

function CartPage(props) {
  const dispatch = useDispatch();

  const [Total, setTotal] = useState(0);
  const [ShowTotal, setShowTotal] = useState(false);
  const [ShowSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let cartItems = [];
    //리덕스 User state안에 cart 안에 상품이 들어있는지 확인
    if (props.user.userData && props.user.userData.cart) {
      if (props.user.userData.cart.length > 0) {
        //여기서 카트가 빈게 아닌지 체크하고
        //밑에서 calculate에서 showTotal을 다시 true로 바꿈!
        props.user.userData.cart.forEach((item) => {
          cartItems.push(item.id);
        });
        dispatch(getCartItems(cartItems, props.user.userData.cart)).then(
          (response) => {
            calculateTotal(response.payload);
          }
        );
      }
    }
  }, [props.user.userData]);

  let calculateTotal = (cartDetail) => {
    let total = 0;

    cartDetail.map((item) => {
      total += parseInt(item.price, 10) * item.quantity;
    });

    setTotal(total);
    setShowTotal(true);
  };

  let removeFromCart = (productId) => {
    dispatch(removeCartItem(productId)).then((response) => {
      if (response.payload.productInfo.length <= 0) {
        setShowTotal(false);
      }
    });
  };

  const transactionSuccess = (data) => {
    dispatch(
      onSuccessBuy({
        paymentData: data,
        cartDetail: props.user.cartDetail,
      })
    ).then((response) => {
      if (response.payload.success) {
        setShowTotal(false);
        setShowSuccess(true);
      }
    });
  };

  return (
    <div style={{ width: "85%", margin: "3rem auto", marginTop: "-1%" }}>
      <h1>My Cart</h1>

      <div>
        <UserCardBlock
          products={props.user.cartDetail}
          removeItem={removeFromCart}
        />
      </div>

      {ShowTotal ? (
        <div style={{ marginTop: "3rem", textAlign: "right" }}>
          <h2>
            Total Amount: <span className={styles.total}>{Total} USD</span>
          </h2>
        </div>
      ) : ShowSuccess ? (
        <Result status="success" title="Successfully Purchased Items" />
      ) : (
        //Result antd 결제 성공후 메세지띄우기
        <>
          <br />
          <br />
          <Empty description={false} />
        </>
      )}

      {ShowTotal && (
        <div className={styles.paypal}>
          <Paypal total={Total} onSuccess={transactionSuccess} />
        </div>
      )}
      {/* util의 paypal에서 onsuccess를 받으면!! transactionSuccess를 작동시킨다! */}
    </div>
  );
}

export default CartPage;
