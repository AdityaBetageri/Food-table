import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import MenuItemCard from '../../components/MenuItemCard';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatCurrency';
import {
  UtensilsCrossed, ShoppingCart, Search, CheckCircle, Clock,
  ArrowRight, Minus, Plus, RotateCcw, ReceiptText, Loader2, ArrowLeft, ChevronDown, ChevronUp,
  ClipboardList, ListOrdered, Activity, LayoutList
} from 'lucide-react';
import { orderAPI, feedbackAPI, menuAPI } from '../../services/api';
import { useSocketContext } from '../../context/SocketContext';
import { groupOrderItems } from '../../utils/orderUtils';

export default function CustomerMenu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const hotelId = searchParams.get('hotel');
  const tableNum = searchParams.get('table') || '?';
  const existingOrderId = searchParams.get('order');
  const { items: cartItems, addItem, removeItem, updateQty, total, itemCount, clearCart } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [categories, setCategories] = useState(['All']);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [vegFilter, setVegFilter] = useState('all');
  const [showCart, setShowCart] = useState(false);
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loadingOrderRestore, setLoadingOrderRestore] = useState(!!existingOrderId);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  const { emit, subscribe, connected } = useSocketContext();
  const [activeOrderId, setActiveOrderId] = useState(existingOrderId);
  const [placedOrderDetails, setPlacedOrderDetails] = useState(null);

  const fetchMenu = useCallback(() => {
    if (!hotelId) return;
    menuAPI.getByHotel(hotelId).then(data => {
      const items = data || [];
      setMenuItems(items);
      setCategories(['All', ...new Set(items.map(i => i.category))]);
      setLoadingMenu(false);
    }).catch(err => {
      console.error("Failed to load menu", err);
      setLoadingMenu(false);
    });
  }, [hotelId]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Listen to menu updates (real-time availability)
  useEffect(() => {
    const unsub = subscribe('menu_update', () => {
      fetchMenu();
    });
    return () => unsub && unsub();
  }, [subscribe, fetchMenu]);

  // Restore order state from URL on mount
  useEffect(() => {
    if (existingOrderId) {
      orderAPI.getPublic(existingOrderId).then(data => {
        if (data) {
          setPlacedOrderDetails({
            items: data.items,
            total: data.total,
            orderNumber: data.orderNumber,
            paymentStatus: data.paymentStatus
          });
          const map = { 'new': 0, 'preparing': 1, 'ready': 2, 'bringing': 3, 'served': 4, 'paid': 5 };
          const stage = map[data.status] || 0;
          setOrderStage(stage);
          setTargetOrderStage(stage);
          setOrderPlaced(true);

          // Check if feedback was already submitted for this order
          const isFeedbackDone = localStorage.getItem(`feedback_done_${existingOrderId}`);
          if (isFeedbackDone) setFeedbackSubmitted(true);
        }
        setLoadingOrderRestore(false);
      }).catch(err => {
        console.error("Failed to restore order state", err);
        setLoadingOrderRestore(false);
      });
    }
  }, [existingOrderId]);

  const filtered = useMemo(() => {
    const list = menuItems.filter(i => {
      if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (category !== 'All' && i.category !== category) return false;
      if (vegFilter === 'veg' && !i.isVeg) return false;
      if (vegFilter === 'nonveg' && i.isVeg) return false;
      return true;
    });
    // Sort unavailable items to the end
    return [...list].sort((a, b) => (a.isAvailable === b.isAvailable) ? 0 : a.isAvailable ? -1 : 1);
  }, [menuItems, search, category, vegFilter]);

  const ORDER_STAGES = [
    { key: 'new', label: 'Order Received', desc: 'Your order has been received by the kitchen', icon: '📥', color: '#3498DB' },
    { key: 'preparing', label: 'Preparing', desc: 'The chef is preparing your delicious food', icon: '👨‍🍳', color: '#F39C12' },
    { key: 'ready', label: 'Ready', desc: 'Your order is ready and plated', icon: '✅', color: '#27AE60' },
    { key: 'bringing', label: 'Waiter is Bringing Your Order', desc: 'Your food is on its way to your table', icon: '🏃', color: '#9B59B6' },
    { key: 'served', label: 'Served', desc: 'Enjoy your meal!', icon: '🍽️', color: '#27AE60' },
    { key: 'paid', label: 'Paid', desc: 'Payment completed. Thank you!', icon: '💳', color: '#111827' },
  ];

  const [targetOrderStage, setTargetOrderStage] = useState(0);
  const [orderStage, setOrderStage] = useState(0);

  useEffect(() => {
    if (orderStage < targetOrderStage) {
      const timer = setTimeout(() => {
        setOrderStage(prev => prev + 1);
      }, 800); // 800ms between each stage jump
      return () => clearTimeout(timer);
    } else if (orderStage > targetOrderStage) {
      setOrderStage(targetOrderStage); // snap back if needed
    }
  }, [orderStage, targetOrderStage]);

  const [overallRating, setOverallRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showBill, setShowBill] = useState(false);

  // Subscribe to Hotel Room
  useEffect(() => {
    if (hotelId && connected) {
      emit('join_hotel', { hotelId });
    }
  }, [hotelId, connected, emit]);

  // Listen to order status updates
  useEffect(() => {
    if (activeOrderId) {
      const unsubStatus = subscribe('order_status_update', (data) => {
        if (data.orderId === activeOrderId) {
          const map = { 'new': 0, 'preparing': 1, 'ready': 2, 'bringing': 3, 'served': 4, 'paid': 5 };
          setTargetOrderStage(map[data.status] || 0);
          if (data.order) {
            setPlacedOrderDetails({
              items: data.order.items,
              total: data.order.total,
              orderNumber: data.order.orderNumber,
              paymentStatus: data.order.paymentStatus
            });
          }
        }
      });

      const unsubPayment = subscribe('payment_confirmed', (data) => {
        if (data.orderId === activeOrderId) {
          if (data.order) {
            setPlacedOrderDetails({
              items: data.order.items,
              total: data.order.total,
              orderNumber: data.order.orderNumber,
              paymentStatus: data.order.paymentStatus
            });
            const map = { 'new': 0, 'preparing': 1, 'ready': 2, 'bringing': 3, 'served': 4, 'paid': 5 };
            setTargetOrderStage(map[data.order.status] || 0);
          }
        }
      });

      return () => {
        unsubStatus && unsubStatus();
        unsubPayment && unsubPayment();
      };
    }
  }, [activeOrderId, subscribe]);

  // Handle back navigation and page exit during active order
  useEffect(() => {
    if (orderPlaced) {
      window.history.pushState({ orderTracker: true }, '');
      const handlePopState = () => setOrderPlaced(false);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [orderPlaced]);

  useEffect(() => {
    if (orderPlaced && orderStage < 5) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = 'Your order is in progress. Are you sure you want to leave?';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [orderPlaced, orderStage]);

  const placeOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const payload = {
        hotelId,
        tableNumber: Number(tableNum),
        items: cartItems.map(i => ({ name: i.name, price: i.price, qty: i.qty, menuItemId: i._id, notes: i.notes || '' })),
        specialInstructions: '',
        orderId: existingOrderId || activeOrderId
      };
      const res = await orderAPI.create(payload);
      setActiveOrderId(res._id);
      setPlacedOrderDetails({
        items: res.items,
        total: res.total,
        orderNumber: res.orderNumber,
        paymentStatus: res.paymentStatus
      });
      setOrderPlaced(true);
      setTargetOrderStage(0);
      setOrderStage(0);
      setShowCart(false);
      clearCart();

      // Update URL with order ID
      setSearchParams({ hotel: hotelId, table: tableNum, order: res._id });
    } catch (err) {
      alert("Failed to place order: " + err.message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const submitFeedback = async () => {
    if (!overallRating || isSubmittingFeedback) return;
    setIsSubmittingFeedback(true);
    try {
      await feedbackAPI.submit({
        orderId: activeOrderId,
        hotelId,
        rating: overallRating,
        foodRating,
        comment: feedback
      });
      localStorage.setItem(`feedback_done_${activeOrderId}`, 'true');
      setFeedbackSubmitted(true);
    } catch (err) {
      alert("Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const resetFlow = () => {
    if (orderStage === 5) {
      setOrderPlaced(false);
      setTargetOrderStage(0);
      setOrderStage(0);
      setOverallRating(0);
      setFoodRating(0);
      setFeedback('');
      setFeedbackSubmitted(false);
      setPlacedOrderDetails(null);
      setActiveOrderId(null);
      setSearchParams({ hotel: hotelId, table: tableNum });
    } else {
      setOrderPlaced(false);
    }
  };

  const hasUnavailableInCart = useMemo(() => {
    return cartItems.some(ci => {
      const m = menuItems.find(mi => mi._id === ci.menuItemId);
      return m && m.isAvailable === false;
    });
  }, [cartItems, menuItems]);

  const renderStars = (ratingValue, setRatingFn) => (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => setRatingFn(star)}
          style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: ratingValue >= star ? '#F1C40F' : '#E2E8F0', transition: 'color .2s', padding: 0 }}
        >
          ★
        </button>
      ))}
    </div>
  );

  if (loadingOrderRestore) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #E2E8F0', borderTopColor: '#2E86C1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: '#64748B', fontWeight: 600 }}>Loading your order status...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (orderPlaced) {
    if (orderStage === 5) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', padding: '24px', textAlign: 'center' }}>
          <div style={{ maxWidth: '420px', width: '100%', animation: 'orderFadeIn .6s ease' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#166534', marginBottom: '12px', fontFamily: "'Outfit',sans-serif" }}>Thank You!</h2>
            <p style={{ color: '#475569', fontSize: '16px', marginBottom: '32px' }}>Your payment has been successfully processed and your order is complete.</p>

            {/* Feedback Section */}
            {!feedbackSubmitted ? (
              <div style={{ background: '#fff', padding: '24px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', textAlign: 'left', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', color: '#1B4F72' }}>How was your experience?</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#4A5568' }}>Food Quality</span>
                  {renderStars(foodRating, setFoodRating)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#4A5568' }}>Service & Experience</span>
                  {renderStars(overallRating, setOverallRating)}
                </div>
                
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us what you liked or how we can improve..."
                  style={{ width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0', marginBottom: '16px', fontSize: '14px', resize: 'none', minHeight: '100px', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = '#2E86C1'}
                  onBlur={(e) => e.target.style.borderColor = '#E2E8F0'}
                />
                
                <button
                  onClick={submitFeedback}
                  disabled={!overallRating || isSubmittingFeedback}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', height: 'auto', opacity: !overallRating || isSubmittingFeedback ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '16px', fontWeight: 700 }}
                >
                  {isSubmittingFeedback ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Submit & Close'}
                </button>
              </div>
            ) : (
              <div style={{ background: '#fff', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginBottom: '24px', animation: 'orderFadeIn .5s ease' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>⭐</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#1B4F72', marginBottom: '8px' }}>Feedback Received!</h3>
                <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>We truly value your input. See you again soon!</p>
              </div>
            )}

            <button 
              onClick={resetFlow} 
              style={{ width: '100%', background: 'transparent', border: '2px solid #166534', color: '#166534', padding: '14px', borderRadius: '16px', fontWeight: 800, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              <RotateCcw size={18} /> Start New Order
            </button>
          </div>
          <style>{`
            @keyframes orderFadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      );
    }

    const current = ORDER_STAGES[orderStage];
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #E8F8F0, #D5F5E3)', padding: '24px', paddingTop: '24px' }}>
        <div style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>

          {/* Back Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
            <button onClick={resetFlow} style={{ background: 'transparent', border: 'none', color: '#1B4F72', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
              <ArrowLeft size={18} /> Back to Menu
            </button>
          </div>

          {/* Animated Icon & Status Text */}
          <div key={orderStage} style={{ fontSize: '56px', marginBottom: '12px', animation: 'orderBounce .6s ease' }}>{current.icon}</div>
          <h2 key={`t-${orderStage}`} style={{ fontSize: '24px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", color: current.color, marginBottom: '6px', animation: 'orderFadeIn .5s ease' }}>{current.label}</h2>
          <p style={{ color: '#4A5568', fontSize: '14px', marginBottom: '24px' }}>{current.desc}</p>

          {/* Timeline */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0', textAlign: 'left', background: '#fff', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 4px 20px rgba(0,0,0,.06)', marginBottom: '20px' }}>
            {placedOrderDetails?.orderNumber && (
              <div style={{ position: 'absolute', top: '-14px', right: '16px', fontSize: '12px', fontWeight: 800, color: '#2E86C1', background: '#EBF8FF', padding: '4px 10px', borderRadius: '8px', border: '1px solid #AED6F1', zIndex: 10 }}>
                Order ID: #{placedOrderDetails.orderNumber.toString().padStart(3, '0')}
              </div>
            )}
            {ORDER_STAGES.slice(0, 5).map((s, i) => { // Only show up to 'Served' in timeline here
              const done = i < orderStage;
              const active = i === orderStage;
              return (
                <div key={s.key} style={{ display: 'flex', gap: '14px', position: 'relative', paddingBottom: i < 4 ? '20px' : '0' }}>
                  {i < 4 && (
                    <div style={{ position: 'absolute', left: '15px', top: '32px', width: '2px', height: 'calc(100% - 32px)', background: done ? '#27AE60' : '#EDF2F7', transition: 'background .5s' }} />
                  )}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                    background: done ? '#27AE60' : active ? current.color : '#EDF2F7',
                    color: done || active ? '#fff' : '#A0AEC0',
                    transition: 'all .4s', fontWeight: 700,
                    boxShadow: active ? `0 0 0 4px ${current.color}30` : 'none',
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <div style={{ paddingTop: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: done || active ? 700 : 500, color: done ? '#27AE60' : active ? current.color : '#A0AEC0', transition: 'color .4s' }}>{s.label}</div>
                    {active && <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{s.desc}</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Details (History / Digital Bill) */}
          {placedOrderDetails && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', textAlign: 'left', boxShadow: '0 4px 20px rgba(0,0,0,.06)', marginBottom: '20px' }}>
              <button
                onClick={() => setShowBill(!showBill)}
                style={{ width: '100%', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1B4F72' }}>
                  <ReceiptText size={18} /> {orderStage >= 4 ? 'Digital Bill' : 'Your Order'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700, color: '#2E86C1' }}>
                  {showBill ? 'Hide' : 'View'} {showBill ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {showBill && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px dashed #CBD5E1', animation: 'fadeIn .3s ease' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {groupOrderItems(placedOrderDetails.items).map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#475569' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {item.qty}x {item.name}
                          {orderStage >= 4 ? (
                            <span style={{ fontSize: '9px', background: '#DCFCE7', color: '#166534', padding: '1px 5px', borderRadius: '4px', fontWeight: 800, border: '1px solid #86EFAC' }}>SERVED</span>
                          ) : (
                            <span style={{ fontSize: '9px', background: '#FFF9C4', color: '#F57F17', padding: '1px 5px', borderRadius: '4px', fontWeight: 800, border: '1px solid #FBC02D' }}>PREPARING</span>
                          )}
                        </span>
                        <span style={{ fontWeight: 600 }}>{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', paddingTop: '12px', borderTop: '2px dashed #CBD5E1', fontWeight: 800, fontSize: '18px', color: '#1B4F72' }}>
                    <span>Total</span>
                    <span>{formatCurrency(placedOrderDetails.total)}</span>
                  </div>
                  {orderStage >= 4 && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Payment Status</span>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: placedOrderDetails.paymentStatus === 'paid' ? '#DCFCE7' : '#FEE2E2',
                        color: placedOrderDetails.paymentStatus === 'paid' ? '#166534' : '#991B1B',
                        textTransform: 'uppercase'
                      }}>
                        {placedOrderDetails.paymentStatus === 'paid' ? 'Paid' : 'Not Paid'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Warning to pay */}
          {orderStage === 4 && placedOrderDetails?.paymentStatus !== 'paid' && (
            <div style={{ background: '#FFFBEB', padding: '12px', borderRadius: '10px', border: '1px solid #FEF3C7', marginBottom: '20px', animation: 'orderPulse 2s infinite' }}>
              <p style={{ color: '#92400E', fontSize: '14px', fontWeight: 700, margin: 0 }}>💳 Please reach the cashier to complete your payment.</p>
            </div>
          )}

          {/* Action Buttons */}
          <button onClick={resetFlow} className="btn btn-primary btn-lg" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <RotateCcw size={16} /> Order More Items
          </button>
        </div>

        <style>{`
          @keyframes orderBounce { 0% { transform: scale(0.3) rotate(-10deg); opacity: 0; } 50% { transform: scale(1.15) rotate(5deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
          @keyframes orderFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes orderPulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1B4F72, #2E86C1)', padding: '20px 16px', color: '#fff', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UtensilsCrossed size={20} style={{ color: '#AED6F1' }} />
              Table<span style={{ color: '#AED6F1' }}>Tap</span>
            </span>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '2px' }}>
              Table {tableNum}
            </div>
          </div>
          <button onClick={() => setShowCart(true)} style={{ position: 'relative', background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '12px', padding: '10px 16px', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} />
            {itemCount > 0 && <span style={{ background: '#E74C3C', borderRadius: '999px', padding: '2px 8px', fontSize: '12px', fontWeight: 700 }}>{itemCount}</span>}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '16px', paddingBottom: '120px' }}>
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#A0AEC0' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu..." style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: '12px', border: '2px solid #E2E8F0', fontSize: '14px', background: '#fff', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: '6px 16px', borderRadius: '999px', fontSize: '13px', fontWeight: 500, border: 'none', background: category === c ? '#2E86C1' : '#EDF2F7', color: category === c ? '#fff' : '#64748B', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>{c}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
          {[
            { key: 'all', label: 'All' },
            { key: 'veg', label: 'Veg', dotColor: '#27AE60' },
            { key: 'nonveg', label: 'Non-Veg', dotColor: '#C0392B' },
          ].map(f => (
            <button key={f.key} onClick={() => setVegFilter(f.key)} style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, border: '1px solid', borderColor: vegFilter === f.key ? '#2E86C1' : '#E2E8F0', background: vegFilter === f.key ? 'rgba(46,134,193,.1)' : 'transparent', color: vegFilter === f.key ? '#2E86C1' : '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {f.dotColor && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.dotColor }} />}
              {f.label}
            </button>
          ))}
        </div>

        {/* Menu Items */}
        {loadingMenu ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#A0AEC0' }}>Loading menu...</div>
        ) : (
          <>
            {/* Removed inline Current Order section to move to bottom nav */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: '12px' }}>
              {filtered.map(item => {
                const cartItem = cartItems.find(ci => ci.menuItemId === item._id);
                const qty = cartItem ? cartItem.qty : 0;
                return (
                  <MenuItemCard
                    key={item._id}
                    item={item}
                    cartQty={qty}
                    onIncrease={() => addItem(item, 1)}
                    onDecrease={() => updateQty(item._id, qty - 1)}
                  />
                );
              })}
            </div>
          </>
        )}
        {!loadingMenu && filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#A0AEC0' }}>No items found</div>}
      </div>

      {/* Cart Drawer */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.5)' }} onClick={() => setShowCart(false)}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '20px 20px 0 0', maxHeight: '80vh', overflow: 'auto', padding: '24px', animation: 'fadeIn .3s ease' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingCart size={20} /> Your Cart
            </h3>
            {cartItems.length === 0 ? (
              <p style={{ color: '#A0AEC0', textAlign: 'center', padding: '20px' }}>Cart is empty</p>
            ) : (
              <>
                {cartItems.map((ci, idx) => {
                  const menuItem = menuItems.find(m => m._id === ci.menuItemId);
                  const isAvailable = menuItem ? menuItem.isAvailable : true;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #EDF2F7', opacity: isAvailable ? 1 : 0.6 }}>
                      <div style={{ flex: 1, marginRight: '12px' }}>
                        <div style={{ fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {ci.name}
                          {!isAvailable && <span style={{ fontSize: '10px', background: '#FEE2E2', color: '#EF4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>Currently Unavailable</span>}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748B' }}>{formatCurrency(ci.price)} each</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => updateQty(ci.menuItemId, ci.qty - 1, ci.notes)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{ci.qty}</span>
                        <button
                          onClick={() => isAvailable && updateQty(ci.menuItemId, ci.qty + 1, ci.notes)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '6px', border: '1px solid #E2E8F0',
                            background: isAvailable ? '#fff' : '#F1F5F9',
                            cursor: isAvailable ? 'pointer' : 'not-allowed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: isAvailable ? 1 : 0.5
                          }}
                        >
                          <Plus size={14} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: '60px', textAlign: 'right', fontSize: '14px' }}>{formatCurrency(ci.price * ci.qty)}</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 8px', fontWeight: 800, fontSize: '18px' }}>
                  <span>Total</span><span>{formatCurrency(total)}</span>
                </div>
                {hasUnavailableInCart && (
                  <div style={{ color: '#E53E3E', background: '#FFF5F5', padding: '8px', borderRadius: '8px', fontSize: '12px', textAlign: 'center', marginBottom: '8px', fontWeight: 600, border: '1px solid #FEB2B2' }}>
                    Some items are currently unavailable. Please remove them to proceed.
                  </div>
                )}
                <button
                  onClick={placeOrder}
                  disabled={hasUnavailableInCart || isPlacingOrder}
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%', justifyContent: 'center', marginTop: '8px',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    opacity: hasUnavailableInCart || isPlacingOrder ? 0.6 : 1,
                    cursor: hasUnavailableInCart || isPlacingOrder ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isPlacingOrder ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Placing Order...</>
                  ) : hasUnavailableInCart ? (
                    'Unavailable Items in Cart'
                  ) : (
                    <>Place Order <ArrowRight size={16} /></>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Summary Drawer */}
      {showOrderSummary && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,.5)' }} onClick={() => setShowOrderSummary(false)}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#fff', borderRadius: '24px 24px 0 0', maxHeight: '80vh', overflow: 'auto', padding: '24px', animation: 'fadeIn .3s ease' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px', fontFamily: "'Outfit',sans-serif", display: 'flex', alignItems: 'center', gap: '8px', color: '#1B4F72' }}>
              <LayoutList size={20} /> Your Order Summary
            </h3>
            {placedOrderDetails ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {groupOrderItems(placedOrderDetails.items).map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#1B4F72' }}>{item.qty}x {item.name}</div>
                      <div style={{ marginTop: '4px' }}>
                        {orderStage >= 4 ? (
                          <span style={{ fontSize: '10px', background: '#DCFCE7', color: '#166534', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>SERVED</span>
                        ) : (
                          <span style={{ fontSize: '10px', background: '#FFF9C4', color: '#F57F17', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>PREPARING</span>
                        )}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#1B4F72' }}>{formatCurrency(item.price * item.qty)}</div>
                  </div>
                ))}
                <div style={{ marginTop: '12px', padding: '16px', borderTop: '2px dashed #CBD5E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '20px', color: '#1B4F72' }}>
                  <span>Total Bill</span>
                  <span>{formatCurrency(placedOrderDetails.total)}</span>
                </div>
                <button onClick={() => { setShowOrderSummary(false); setOrderPlaced(true); }} style={{ width: '100%', marginTop: '10px', padding: '14px', borderRadius: '14px', background: '#EBF8FF', color: '#2E86C1', border: '1px solid #AED6F1', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Activity size={18} /> View Live Status Tracker
                </button>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#64748B', padding: '20px' }}>No active order found.</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      {(itemCount > 0 || activeOrderId) && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: '568px',
          height: '74px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          borderRadius: '26px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.4)',
          zIndex: 60,
          animation: 'navSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          {/* Left: My Order (Summary) */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
            {activeOrderId ? (
              <button
                onClick={() => setShowOrderSummary(true)}
                style={{
                  width: '52px', height: '52px', borderRadius: '18px',
                  background: '#fff', border: '1px solid #E2E8F0',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: '#1B4F72', cursor: 'pointer', transition: 'all 0.2s',
                  position: 'relative', gap: '2px'
                }}
              >
                <LayoutList size={20} />
                <span style={{ fontSize: '8px', fontWeight: 800 }}>MY ORDER</span>
              </button>
            ) : (
              <div style={{ width: '52px' }} />
            )}
          </div>

          {/* Center: View Cart Pill */}
          <div style={{ display: 'flex', justifyContent: 'center', flex: 2 }}>
            {itemCount > 0 && (
              <button
                onClick={() => setShowCart(true)}
                style={{
                  background: 'linear-gradient(135deg, #1B4F72, #2E86C1)',
                  color: '#fff', padding: '12px 22px', borderRadius: '18px',
                  fontSize: '14px', fontWeight: 700, border: 'none',
                  cursor: 'pointer', boxShadow: '0 8px 20px rgba(27,79,114,0.35)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  whiteSpace: 'nowrap', animation: 'pillSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <ShoppingCart size={18} />
                <span>Cart ({itemCount})</span>
              </button>
            )}
          </div>

          {/* Right: Order Status Icon */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {activeOrderId ? (
              <button
                onClick={() => setOrderPlaced(true)}
                style={{
                  width: '52px', height: '52px', borderRadius: '18px',
                  background: '#fff', border: '1px solid #E2E8F0',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: '#2E86C1', cursor: 'pointer', transition: 'all 0.2s',
                  position: 'relative', gap: '2px'
                }}
              >
                <Activity size={20} />
                <span style={{ fontSize: '8px', fontWeight: 800 }}>STATUS</span>
                <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '10px', height: '10px', background: '#27AE60', borderRadius: '50%', border: '2px solid #fff' }} />
              </button>
            ) : (
              <div style={{ width: '52px' }} />
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes navSlideUp {
          from { opacity: 0; transform: translate(-50%, 40px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes pillSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}