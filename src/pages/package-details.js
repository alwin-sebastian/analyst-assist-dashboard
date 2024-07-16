import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Descriptions, Spin, message, Tag, Typography, Button, Modal, Form, Input, Upload, Card, Layout, Menu } from "antd";
import axios from "axios";
import { UploadOutlined, FilePdfOutlined, MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";


const { Title } = Typography;
const { Header, Sider, Content } = Layout;

export default function PackageDetails() {
  const { packageName } = useParams();
  const location = useLocation();
  // const packageDetails = location.state.packageDetails;
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [packageDetails, setPackageDetails] = useState(null);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      try {
        const response = await axios.get(`https://b20os9s2j7.execute-api.us-east-1.amazonaws.com/test/packages/get-package-details?templateId=${location.state.packageDetails.TemplateId}`);
        setPackageDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        message.error("Failed to fetch package details");
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [location.state.packageDetails]);

  const handleEdit = () => {
    form.setFieldsValue(packageDetails); 
    setIsModalVisible(true); 
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      await axios.put(`https://api-endpoint/update-package/${packageName}`, values);
      message.success("Package details updated successfully");
      setIsModalVisible(false); 
    } catch (error) {
      console.error(error);
      message.error("Failed to update package details");
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleFileClick = (file) => {
    setSelectedFile(file);
  };

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  if (!packageDetails) {
    return <p>No template details found</p>;
  }

  return (
    <div className="p-6 h-full">
    <h2 className="text-2xl font-semibold mb-4">Template Details</h2>
    <div className="border rounded-lg p-6 bg-white shadow-md">
      <Descriptions title=" " bordered column={1}>
        <Descriptions.Item label="Template Name">
        {packageDetails.TemplateName}
        </Descriptions.Item>
        <Descriptions.Item label="Template Type">
        <Tag>{location.state.packageDetails.TemplateType} </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Template ID">
            {packageDetails.TemplateId}
        </Descriptions.Item>
        <Descriptions.Item label="Files">
        <ul>
        {location.state.packageDetails.files.map((file, index) => (
            <li key={index}>
            <a href={file.location} target="_blank" rel="noopener noreferrer">
                {file.name}
            </a>
            </li>
        ))}
        </ul>
        </Descriptions.Item>
      </Descriptions>
      <Button type="primary" onClick={handleEdit} style={{ marginTop: '16px' }}>
          Edit Template
        </Button>
      </div>

      <Modal
        title="Edit Template"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Template Name"
            name="TemplateName"
            rules={[{ required: true, message: 'Please input the Template name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Template Type"
            name="TemplateType"
            rules={[{ required: true, message: 'Please input the Template type!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Upload Files">
            <Upload
              multiple
              beforeUpload={() => false} 
              fileList={fileList}
              onChange={handleUploadChange}
              maxCount={5} 
            >
              <Button icon={<UploadOutlined />}>Drag and drop files here or click to upload</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Template File Views</h2>
      <Layout style={{ background: '#fff' }}>
        <Sider trigger={null} collapsible collapsed={collapsed} width={250} style={{ background: "#63b3ed" }}>
          <div className="logo" />
          <Button type="primary" onClick={toggle} className="m-4">
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          <ul>
            {location.state.packageDetails?.files?.map((file, index) => (
              <li key={index} className="mb-2 p-2">
                <Card
                  hoverable
                  cover={<FilePdfOutlined style={{ fontSize: '48px' }} />}
                  className="p-2"
                  onClick={() => handleFileClick(file)}
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
      <h3 className="text-lg font-semibold mb-4">Form Preview</h3>
      {packageDetails.Forms.map((form, index) => {
  const formFields = JSON.parse(form.FormFields);
  return (
    <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50 shadow">
      <h4 className="font-semibold text-xl mb-2">{form.FormName}</h4>
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(formFields).map(([section, fields], idx) => (
          <div key={idx} className="border-b mb-4 pb-2">
            <h5 className="font-bold text-lg">{section}</h5>
            <div className="space-y-2">
              {Object.entries(fields).map(([fieldName, fieldValue], fieldIdx) => {
                const valueToDisplay = typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : fieldValue;
                return (
                  <div key={fieldIdx} className="flex justify-between">
                    <strong>{fieldName}:</strong>
                    <span>{valueToDisplay}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
})}
    </div>
  </Content>
  </Layout>
  <div className="w-1/5 p-4 border-l bg-gray-600">
    <h3 className="text-lg font-semibold mb-4">Chatbox</h3>
    <p>Chatbox here...</p>
  </div>
  </Layout>
  </div>
  );
}