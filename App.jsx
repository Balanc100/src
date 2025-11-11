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
            <h3 className="font-bold text-lg mb-3 text-blue-900 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              แนบสลิปการโอนเงิน
            </h3>
            
            {!slipPreview ? (
              <div>
                <label className="cursor-pointer">
                  <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:bg-blue-100 transition-colors">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                    <p className="text-blue-700 font-medium">คลิกเพื่ออัพโหลดสลิป</p>
                    <p className="text-sm text-gray-600 mt-1">รองรับไฟล์ JPG, PNG</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSlipUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <img 
                    src={slipPreview} 
                    alt="Slip preview" 
                    className="w-full max-h-64 object-contain border-2 border-blue-200 rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSlipFile(null);
                      setSlipPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-green-600 font-medium">✓ อัพโหลดสลิปเรียบร้อยแล้ว</p>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                saveOrder();
                resetForm();
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
              บันทึกออเดอร์และสร้างใหม่
            </button>
            
            <button
              onClick={resetForm}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors"
            >
              สร้างออเดอร์ใหม่
            </button>

            {orders.length > 0 && (
              <button
                onClick={exportToCSV}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                ดาวน์โหลด CSV ({orders.length} ออเดอร์)
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-800">ฟอร์มรับออเดอร์</h1>
        </div>

        <div>
          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-indigo-900">ข้อมูลลูกค้า</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  placeholder="0XX-XXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  ที่อยู่จัดส่ง
                </label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                  rows="3"
                  placeholder="กรอกที่อยู่สำหรับจัดส่ง"
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">รายการสินค้า</h2>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-gray-700">สินค้า #{index + 1}</span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        เลือกสินค้า <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(item.id, 'productId', e.target.value)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="">-- กรุณาเลือก --</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.price} บาท/แพ็ค)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        จำนวน (แพ็ค) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                        placeholder="จำนวน"
                      />
                    </div>
                  </div>
                  {item.name && (
                    <div className="mt-3 p-3 bg-white rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {item.name} × {item.quantity} แพ็ค
                        </span>
                        <span className="font-bold text-indigo-600">
                          {(item.price * item.quantity).toLocaleString()} บาท
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-4 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
            >
              <Plus className="w-5 h-5" />
              เพิ่มสินค้า
            </button>
          </div>

          <div className="bg-indigo-50 rounded-xl p-6 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>ยอดรวมสินค้า</span>
                <span className="font-semibold">{calculateSubtotal().toLocaleString()} บาท</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <div className="flex items-center gap-2">
                  <span>ค่าจัดส่ง</span>
                  {calculateShipping() === 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                      ฟรี!
                    </span>
                  )}
                </div>
                <span className={calculateShipping() === 0 ? 'line-through text-gray-400' : 'font-semibold'}>
                  {calculateShipping() === 0 ? '300' : calculateShipping().toLocaleString()} บาท
                </span>
              </div>
              {calculateSubtotal() > 0 && calculateSubtotal() < 1000 && (
                <p className="text-sm text-orange-600 italic">
                  💡 ซื้อเพิ่มอีก {(1000 - calculateSubtotal()).toLocaleString()} บาท เพื่อส่งฟรี!
                </p>
              )}
              {calculateShipping() === 0 && calculateSubtotal() >= 1000 && (
                <p className="text-sm text-green-600 italic">
                  ✨ ยอดซื้อครบ 1,000 บาท ส่งฟรี!
                </p>
              )}
              <div className="flex justify-between text-xl font-bold text-indigo-600 pt-2 border-t-2 border-indigo-200">
                <span>ยอดรวมทั้งหมด</span>
                <span>{calculateTotal().toLocaleString()} บาท</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
          >
            สร้างใบสรุปยอดสั่งซื้อ
          </button>
        </div>
      </div>
    </div>
  );
}
