import { Button } from 'antd'
import React from 'react'

function UserFooter() {
  return (
    <div className='bg-ghead text-thead text-center h-[80px]'>
      <div className="bg-ghead text-thead text-center">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
            <div>
              <h3 className="text-lg font-semibold mb-4">Về chúng tôi</h3>
              <p>Cửa hàng xe điện uy tín, chất lượng hàng đầu Việt Nam</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
              <p>Email: info@ebikestore.com</p>
              <p>Điện thoại: 0123 456 789</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Hỗ trợ</h3>
              <p>Hướng dẫn mua hàng</p>
              <p>Chính sách bảo hành</p>
              <p>Chính sách đổi trả</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Kết nối với chúng tôi</h3>
              <div className="flex space-x-4">
                <Button shape="circle" icon={<span className="icon-facebook" />} />
                <Button shape="circle" icon={<span className="icon-youtube" />} />
                <Button shape="circle" icon={<span className="icon-zalo" />} />
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-700">
            <p>© 2023 E-Bike Store. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserFooter
