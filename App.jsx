import React, { useState } from 'react';
import { Plus, Trash2, ShoppingCart, Receipt, Upload, Download } from 'lucide-react';

export default function OrderForm() {
  const products = [
    { id: 1, name: 'BALANC 600 ml', price: 300 },
    { id: 2, name: 'BALANC 1500 ml', price: 300 }
  ];

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [items, setItems] = useState([
    { id: 1, productId: '', name: '', price: 0, quantity: 1 }
  ]);

  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [orders, setOrders] = useState([]);

  const addItem = () => {
    setItems([...items, { 
      id: Date.now(), 
      productId: '',
      name: '', 
      price: 0, 
      quantity: 1 
    }]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        if (field === 'productId') {
          const product = products.find(p => p.id === parseInt(value));
          if (product) {
            return { ...item, productId: value, name: product.name, price: product.price };
          }
          return { ...item, productId: '', name: '', price: 0 };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 1000 ? 0 : 300;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleSlipUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!customerInfo.name || !customerInfo.phone) {
      alert('กรุณากรอกชื่อและเบอร์โทรศัพท์');
      return;
    }
    
    const hasEmptyItems = items.some(item => !item.name || item.price <= 0);
    if (hasEmptyItems) {
      alert('กรุณาเลือกสินค้าให้ครบถ้วน');
      return;
    }
    
    setShowSummary(true);
  };

  const saveOrder = () => {
    const orderData = {
      orderNumber: `ORD${Date.now()}`,
      date: new Date().toLocaleString('th-TH'),
      customer: customerInfo,
      items: items.filter(item => item.name),
      subtotal: calculateSubtotal(),
      shipping: calculateShipping(),
      total: calculateTotal(),
      slipUploaded: slipFile ? 'Yes' : 'No',
      slipFileName: slipFile ? slipFile.name : '-'
    };
    
    setOrders([...orders, orderData]);
    alert('บันทึกออเดอร์เรียบร้อยแล้ว!');
  };

  const exportToCSV = () => {
    if (orders.length === 0) {
      alert('ยังไม่มีออเดอร์ที่บันทึกไว้');
      return;
    }

    let csv = 'เลขที่ออเดอร์,วันที่,ชื่อลูกค้า,เบอร์โทร,ที่อยู่,รายการสินค้า,ยอดรวมสินค้า,ค่าจัดส่ง,ยอดรวมทั้งหมด,สลิปแนบ,ชื่อไฟล์สลิป\n';
    
    orders.forEach(order => {
      const itemsList = order.items.map(item => 
        `${item.name} x${item.quantity}`
      ).join(' | ');
      
      csv += `${order.orderNumber},${order.date},"${order.customer.name}",${order.customer.phone},"${order.customer.address}","${itemsList}",${order.subtotal},${order.shipping},${order.total},${order.slipUploaded},${order.slipFileName}\n`;
    });

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setCustomerInfo({ name: '', phone: '', address: '' });
    setItems([{ id: 1, productId: '', name: '', price: 0, quantity: 1 }]);
    setSlipFile(null);
    setSlipPreview(null);
    setShowSummary(false);
  };

  if (showSummary) {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    const total = calculateTotal();

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Receipt className="w-8 h-8 text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-800">สรุปยอดสั่งซื้อ</h2>
          </div>

          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-3 text-indigo-900">ข้อมูลลูกค้า</h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">ชื่อ:</span> {customerInfo.name}</p>
              <p><span className="font-semibold">เบอร์โทร:</span> {customerInfo.phone}</p>
              {customerInfo.address && (
                <p><span className="font-semibold">ที่อยู่:</span> {customerInfo.address}</p>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3 text-gray-800">รายการสินค้า</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{index + 1}. {item.name}</p>
                    <p className="text-sm text-gray-600">
                      ราคา {item.price.toLocaleString()} บาท × {item.quantity} แพ็ค
                    </p>
                  </div>
                  <p className="font-bold text-indigo-600 text-lg">
                    {(item.price * item.quantity).toLocaleString()} บาท
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-2 border-gray-200 pt-4 space-y-2 mb-6">
            <div className="flex justify-between text-gray-700">
              <span>ยอดรวมสินค้า</span>
              <span>{subtotal.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <div className="flex items-center gap-2">
                <span>ค่าจัดส่ง</span>
                {shipping === 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    ฟรี!
                  </span>
                )}
              </div>
              <span className={shipping === 0 ? 'line-through text-gray-400' : ''}>
                {shipping === 0 ? '300' : shipping.toLocaleString()} บาท
              </span>
            </div>
            {shipping === 0 && (
              <p className="text-sm text-green-600 italic">
                ✨ ยอดซื้อครบ 1,000 บาท ส่งฟรี!
              </p>
            )}
            <div className="flex justify-between text-2xl font-bold text-indigo-600 pt-2 border-t border-gray-300">
              <span>ยอดรวมทั้งหมด</span>
              <span>{total.toLocaleString()} บาท</span>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg mb-3 text-yellow-900">💳 ข้อมูลการโอนเงิน</h3>
            <div className="space-y-2 text-gray-700">
              <p><span className="font-semibold">ธนาคาร:</span> ยูโอบี (UOB)</p>
              <p><span className="font-semibold">ชื่อบัญชี:</span> บจก. เน็กซ์ อีรา</p>
              <p className="text-2xl font-bold text-yellow-900 mt-3">
                เลขที่บัญชี: 906-177-1324
              </p>
              <p className="text-xl font-bold text-red-600 mt-3">
                ยอดโอน: {total.toLocaleString()} บาท
              </p>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
