import React from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Alert, Spin } from 'antd';

export default function StatusStrip({ status }) {
  return (
    <div className="status-strip my-4 w-2/3 self-center">
      {status.map((item, index) => (
        <div key={index} className="alert-wrapper">
          <Alert 
          message={
              <div 
              className="space-x-2"
              >
                <Spin indicator={<LoadingOutlined spin />} className='mx-2'/>
                {item.message}
                
              </div>
            }  type={item.type} />
        </div>
      ))}
    </div>
  );
}
