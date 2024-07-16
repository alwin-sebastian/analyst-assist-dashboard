// form to create a new package

import React, {useState, useEffect} from "react";
import axios from 'axios';
import { Form, Input, Button, Select } from "antd";
import { useNavigate } from "react-router-dom";
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import StatusStrip from "../components/StatusStrip";


const { Option } = Select;

const { Dragger } = Upload;
const props = {
  name: 'file',
  multiple: true,
  accept: '.pdf',
    beforeUpload: (file) => {
        const isPDF = file.type === 'application/pdf';
        if (!isPDF) {
            message.error(`${file.name} is not a PDF file`);
        }
        return isPDF || Upload.LIST_IGNORE;
    },
  action: '',
//   onChange(info) {
//     const { status } = info.file;
//     if (status !== 'uploading') {
//       console.log(info.file, info.fileList);
//     }
//     if (status === 'done') {
//       message.success(`${info.file.name} file uploaded successfully.`);
//     } else if (status === 'error') {
//       message.error(`${info.file.name} file upload failed.`);
//     }
//   },
//   onDrop(e) {
//     console.log('Dropped files', e.dataTransfer.files);
//   },
};

export default function CreatePackage() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [status, setStatus] = useState([]);


    const updateStatus = (message, type) => {
        setStatus([{ message, type }]);
      };

    //   useEffect(() => {
    //     return () => {
    //         updateStatus('Creating package...', 'info');
    //     };
    // }, []);

    const extractFormFields = async (items) => {
        const extractPromises = [];
      
        items.forEach(item => {
          item.files.forEach(file => {
            const extractPromise = axios.post('https://b20os9s2j7.execute-api.us-east-1.amazonaws.com/test/packages/extract-form-fields', {
              pdf_path: file.location,
              form_id: file.fileId,
              template_id: item.TemplateId,
              template_name: item.TemplateName
            })
            .then(async (response) => {
                console.log(`Extract form fields API response for fileId ${file.fileId}:`, response.data);
                updateStatus("Processing template...", "info");
                await processTemplate(file.fileId, item.TemplateId, item.TemplateName); 
              })
              .catch(error => {
                console.error(`Error extracting form fields for fileId ${file.fileId}:`, error.response ? error.response.data : error.message);
              });
            extractPromises.push(extractPromise);
          });
        });
      
        // try {
          await Promise.all(extractPromises);
          console.log('All form fields extracted successfully');
        // } catch (error) {
        //   console.error('An error occurred while extracting form fields:', error);
        // }
      };

    const processTemplate = async (formId, templateId, templateName) => {
        try {
            const response = await axios.post(`https://sj6q9j5a24.execute-api.us-east-1.amazonaws.com/prod/templates/${templateId}/process`, {
                FormId: formId,
                TemplateId: templateId,
                TemplateName: templateName
            });
            console.log(`Process template API response for templateId ${templateId}:`, response.data);
            updateStatus('Template processed successfully', 'success');
        } catch (error) {
            console.error(`Error processing template for templateId ${templateId}:`, error.response ? error.response.data : error.message);
            updateStatus('Failed to process template', 'error');
        }
    };
    const onFinish = async (values) => {
        setDisabled(true);
        const { packageName, packageType, files } = values;
        const fileList = files.fileList;

        const isPDF = fileList.every(file => file.type === 'application/pdf') && fileList.length > 0;
        if (!isPDF) {
            message.error('Please upload only PDF files');
        
        return isPDF || Upload.LIST_IGNORE;
        }
        else {
            const filePromises = files.fileList.map(file => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file.originFileObj);
                    reader.onload = () => resolve({
                        name: file.name,
                        content: reader.result.split(',')[1] // Remove the base64 prefix
                    });
                    reader.onerror = error => reject(error);
                });
            });
            
            const fileContents = await Promise.all(filePromises);

            const packageData = {
                packageName,
                packageType,
                files: fileContents
            };

            console.log(packageData);
            try {
                updateStatus('Creating Template...', 'info');
                const response = await axios.post('https://b20os9s2j7.execute-api.us-east-1.amazonaws.com/test/packages/create-package', packageData);
                console.log(response.data);
                updateStatus('Template created successfully', 'success');
                updateStatus('Extracting form fields...', 'info');

                await extractFormFields(response.data.items);
                updateStatus('Form fields extracted successfully', 'success');
                message.success('Template created successfully');
                setDisabled(false);
                navigate('/dashboard/templates');
            } catch (error) {
                console.error(error);
                message.error('Failed to create template');
                setStatus([]);
                setDisabled(false);
            }
        }
    };

    const handleChange = (info) => {
        let newFileList = [...info.fileList];
    
        // Update the file status manually
        newFileList = newFileList.map((file) => {
          if (file.type === 'application/pdf') {
            file.status = 'done';
          } else {
            file.status = 'error';
          }
          return file;
        });
    
        setFileList(newFileList);
      };
    return (
        <div className="p-4 flex flex-col">
            <h2 className="text-xl font-semibold m-4">Create a Template</h2>
            <StatusStrip status={status}/>
            <Form
                form={form}
                layout="vertical"
                name="create-package"
                onFinish={onFinish}
                className="justify-center w-1/2 bg-white rounded-md shadow-md p-4 self-center"
            >
                <Form.Item
                    label="Template Name"
                    name="packageName"
                    rules={[
                        {
                            required: true,
                            message: "Please input template name!",
                        },
                    ]}
                >
                    <Input placeholder="Enter template name" />
                </Form.Item>

                <Form.Item
                    label="Template Type"
                    name="packageType"
                    rules={[
                        {
                            required: true,
                            message: "Please select template type!",
                        },
                    ]}
                >
                    {/* <Select>
                        <Option value="free">Free</Option>
                        <Option value="premium">Premium</Option>
                    </Select> */}
                    <Input placeholder="Enter template type" />
                </Form.Item>

                {/* <Form.Item
                    label="Price"
                    name="price"
                    rules={[
                        {
                            required: true,
                            message: "Please input price!",
                        },
                    ]}
                >
                    <Input />
                </Form.Item> */}
                <Form.Item
                    label="Files"
                    name="files"
                    rules={[
                        {
                            required: true,
                            message: "Please Upload files!",
                        },
                    ]}
                >
                    <Dragger 
                    // {...props}
                    name="file"
                    multiple={true}
                    accept=".pdf"
                    action="" 
                    beforeUpload={(file) => {
                        const isPDF = file.type === 'application/pdf';
                        if (!isPDF) {
                          message.error(`${file.name} is not a PDF file`);
                        //   remove file from fileList
                            return false;
                        }
                        return false; 
                      }}
                    fileList={fileList}
                    onChange={handleChange}
                    showUploadList={{ showRemoveIcon: true }}
                    >
                    <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                    </p>
                    <p className="ant-upload-text">Click or drag files to this area to upload</p>
                    <p className="ant-upload-hint">
                    Support for a single or bulk upload. Upload pdf files only.
                    </p>
                </Dragger>
                 </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={disabled} disabled={disabled}>
                        Create Template
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}

