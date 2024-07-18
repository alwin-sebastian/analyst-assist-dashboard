import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Descriptions, Spin, message, Tag, Typography, Button, Modal, Form, Input, Upload, Card, Layout, Menu } from "antd";
import axios from "axios";
import { UploadOutlined, FilePdfOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import ChatBox from "../components/ChatBox";

const { Title } = Typography;
const { Header, Sider, Content } = Layout;


export default function UserDetails() {
  const { packageName } = useParams();
  const location = useLocation();
  const userDetails = location.state.userDetails;
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    console.log("User Details:", userDetails);
    setLoading(false);
    }, [userDetails]);

    const handleEdit = () => {
      form.setFieldsValue(userDetails); // Set form fields with user details
      setIsModalVisible(true); // Show modal
    };
  
    const handleModalOk = async () => {
      try {
        const values = await form.validateFields();
        await axios.put(`https://your-api-endpoint/update-user/${userDetails.userFileName}`, { ...values, files: fileList });
        message.success("User details updated successfully");
        setIsModalVisible(false); // Close modal
      } catch (error) {
        console.error(error);
        message.error("Failed to update user details");
      }
    };
  
    const handleModalCancel = () => {
      setIsModalVisible(false);
    };
  
    const handleUploadChange = ({ fileList: newFileList }) => {
      setFileList(newFileList);
    };

    const handleFileClick = (file, index) => {
      setSelectedFile(file);
      setSelectedFileIndex(index);
    };
  
    const toggle = () => {
      setCollapsed(!collapsed);
    };

  if (!userDetails) {
    return <p>No user details found</p>;
  }

  return (
    <div className="p-6">
    <h2 className="text-2xl font-semibold mb-4">Client Details</h2>
    <div className="border rounded-lg p-6 bg-white shadow-md">
      <Descriptions title=" " bordered column={1}>
        <Descriptions.Item label="Client Name">
        {userDetails.ClientName}
        </Descriptions.Item>
        <Descriptions.Item label="Client ID">
            {userDetails.ClientId }
        </Descriptions.Item>
        <Descriptions.Item label="Associated Template ID">
            {userDetails.TemplateId}
        </Descriptions.Item>
        {/* <Descriptions.Item label="Package Type">
        <Tag>{packageDetails.packageType}</Tag>
        </Descriptions.Item>
         */}
      <Descriptions.Item label="Chat Files">
          <ul>
            {userDetails.files.map((file, index) => (
              file['file-category'] === 'chat-files' && (
                <li key={index}>
                  <a href={file.location} target="_blank" rel="noopener noreferrer">
                    {file.name}
                  </a>
                </li>
              )
            ))}
          </ul>
        </Descriptions.Item>
        {userDetails.files.some(file => file['file-category'] === 'filled-forms') && (
    <Descriptions.Item label="Filled Forms">
      <ul>
        {userDetails.files.map((file, index) => (
          file['file-category'] === 'filled-forms' && (
            <li key={index}>
              <a href={file.location} target="_blank" rel="noopener noreferrer">
                {file.name}
              </a>
            </li>
          )
        ))}
      </ul>
    </Descriptions.Item>
  )}
      </Descriptions>
      <Button type="primary" onClick={handleEdit} style={{ marginTop: '16px' }}>
          Edit Client File
        </Button>
      </div>

      <Modal
        title="Edit Userfile"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Userfile Name"
            name="userFileName"
            rules={[{ required: true, message: 'Please input the userfile name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="User ID"
            name="userId"
            rules={[{ required: true, message: 'Please input the user ID!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Associated Package ID"
            name="packageId"
            rules={[{ required: true, message: 'Please input the associated package ID!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Upload Files">
            <Upload
              multiple
              beforeUpload={() => false} // Prevent auto-upload
              fileList={fileList}
              onChange={handleUploadChange}
              maxCount={5} // Limit the number of files if necessary
            >
              <Button icon={<UploadOutlined />}>Drag and drop files here or click to upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <h2 className="text-2xl font-semibold mt-8 mb-4">Client File Views</h2>
      <Layout style={{ background: '#fff' }}>
        <Sider trigger={null} collapsible collapsed={collapsed} width={250} style={{ background: "#63b3ed" }}>
          <div className="logo" />
          <Button type="primary" onClick={toggle} className="m-4">
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <ul>
            {userDetails.files.map((file, index) => (
              <li key={index} className="mb-2 p-2">
                <Card
                  hoverable
                  cover={<FilePdfOutlined style={{ fontSize: '48px' }} />}
                  className={`p-2 ${selectedFileIndex === index ? 'border-2 border-blue-500 bg-yellow-100' : ''}`}
                  onClick={() => handleFileClick(file, index)}
                >
                  <Card.Meta title={file.name} />
                </Card>
              </li>
            ))}
          </ul>
        </Sider>
        <Layout>
          <Content style={{ padding: '0 24px', minHeight: 280 }}>
            <div className="p-4 bg-white">
              <h3 className="text-lg font-semibold mb-4">File Preview</h3>
              {selectedFile ? (
                <iframe
                  key={selectedFile.location}
                  src={`https://mozilla.github.io/pdf.js/web/viewer.html?file=${selectedFile.location}`}
                  title={selectedFile.name}
                  width="100%"
                  height="600px"
                  frameBorder="0"
                />
              ) : (
                <p>Select a file to view its content</p>
              )}
            </div>
          </Content>
        </Layout>
        <div className="w-1/4 p-0 border-l">
          {/* <h3 className="text-lg font-semibold mb-4">Chatbox</h3> */}
          <ChatBox ClientId={userDetails.ClientId} />
        </div>
      </Layout>
  </div>
  );
}