import React, {useState, useEffect} from "react";
import { Form, Input, Button, Upload, message,  Select } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const { Dragger } = Upload;
const { Option } = Select;
const textTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

const props = {
    name: 'file',
    multiple: true,
    accept: '.pdf,.doc,.docx,.txt,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      beforeUpload: (file) => {
        const isTextDocument = file.type.startsWith('text/') || // Text files
        file.type === 'application/pdf' || // PDF files
        file.type === 'application/msword' || // DOC files
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; // DOCX files
  
      if (!isTextDocument) {
        message.error(`${file.name} is not a supported text document`);
      }
      return isTextDocument || Upload.LIST_IGNORE;
      },
    // action: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    onChange(info) {
      const { status } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

export default function CreateUserFile() {

    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [packages, setPackages] = useState([]);
    const [fileList, setFileList] = useState([]);
    const [disabled, setDisabled] = useState(false);
    const [filesUploaded, setFilesUploaded] = useState(false);
    const [userfileResponse, setUserfileResponse] = useState();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get('https://b20os9s2j7.execute-api.us-east-1.amazonaws.com/test/packages/get-packages');
        // const packageData = JSON.parse(response.data.body).packages;
        const packageData = response.data?.packages;
        setPackages(packageData);
      } catch (error) {
        console.error('Failed to fetch packages:', error);
        message.error('Failed to load packages');
      }
    };

    fetchPackages();
  }, []);

  const onFinish = async (values) => {
    setDisabled(true);
    console.log("Received values of form: ", values);
    const { userFileName,packageId, uploadFiles } = values;
    const fileList = uploadFiles.fileList;
    console.log(uploadFiles);
    const isTextDocument = fileList.every(file =>
      file.type.startsWith('text/') ||
      file.type === 'application/pdf' ||
      file.type === 'application/msword' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) && fileList.length > 0;

    if (!isTextDocument) {
      message.error('Please upload only supported text documents (PDF, DOC, DOCX, TXT)');
      setDisabled(false);
      return;
    }

    // Read files as base64
    const filePromises = fileList.map(file => {
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

    try {
      const fileContents = await Promise.all(filePromises);

      const userData = {
        userFileName,
        // packageName,
        packageId,
        files: fileContents
      };

      console.log(userData);

      const response = await axios.post('https://b20os9s2j7.execute-api.us-east-1.amazonaws.com/test/userfiles/create-userfile', userData);
      console.log(response.data);
      setUserfileResponse(response.data?.userFile);
      message.success('User file created successfully');
      console.log("User file response state:", userfileResponse);
      const newApiBody = {
        ClientId: response.data?.userFile.userId,
        ClientName: userFileName,
        TemplateId: packageId
      };

      try {
        const newApiResponse = await axios.post(`https://sj6q9j5a24.execute-api.us-east-1.amazonaws.com/prod/clients/${response.data?.userFile.UserId}/process`, newApiBody);
        console.log(newApiResponse.data);
    
        message.success('Additional processing successful');
    } catch (error) {
        if (error.response && error.response.status === 504) { 
            message.info('Client file process is running in the background. Please give some time before clicking on generate PDFs.');
        } else {
            message.error('An error occurred while processing the client file.');
            console.error('Error:', error);
        }
    }

      setDisabled(false);    
      setFilesUploaded(true);
    //   navigate('/dashboard/userfiles');
    } catch (error) {
      console.error('Failed to create user file:', error);
      message.error('Failed to create user file');
        setDisabled(false);
    }
  };


const handleChange = async (info) => {
    let newFileList = [...info.fileList];

    for (let i = 0; i < newFileList.length; i++) {
        const file = newFileList[i];
        if (textTypes.includes(file.type)) {
            file.status = 'done';

            const reader = new FileReader();
            const promise = new Promise((resolve, reject) => {
                reader.onload = () => {
                    file.content = reader.result.split(',')[1]; 
                    resolve();
                };
                reader.onerror = reject;
            });

            reader.readAsDataURL(file.originFileObj);
            await promise; 
        } else {
            file.status = 'error';
            file.content = ''; // Set content to empty string for non-text types or errors
        }
        newFileList[i] = { ...file, name: file.name }; // Ensure 'name' is preserved
    }

    setFileList(newFileList); // Update state with the new fileList
    console.log("Updated fileList:", newFileList);
};

const generateFilledForms = async () => {
  setDisabled(true);

  try {
    
    let MessageIds = userfileResponse.files.map((file) => file.id);
    console.log("MessageIds:", MessageIds);

    for (let index = 0; index < MessageIds.length; index++) {
      let body = {
        userId: userfileResponse.UserId,
        packageId: userfileResponse.TemplateId,
        userFileName: userfileResponse.UserName,
        // MessageId: MessageIds[index]
      };

      const response = await axios.post('https://b20os9s2j7.execute-api.us-east-1.amazonaws.com/test/userfiles/generate-filled-pdf', body);
      console.log(response.data);
    }

    message.success('Filled forms generated successfully');
    setDisabled(false);
    navigate('/dashboard/clients');
  } catch (error) {
    console.error('Error generating filled forms:', error);
    // Handle error if needed
    message.error('Failed to generate filled forms');
    setDisabled(false); // Ensure to reset state on error
  }
};
    return (
        <div className="p-4 flex flex-col">
            <h2 className="text-xl font-semibold m-4">Create a Client File</h2>
            <Form
                form={form}
                layout="vertical"
                name="create-userfile"
                onFinish={onFinish}
                className="justify-center w-1/2 bg-white rounded-md shadow-md p-4 self-center"
            >
                <Form.Item
                    label="Client Name"
                    name="userFileName"
                    rules={[{ required: true, message: "Please enter a client name" }]}
                >
                    <Input />
                </Form.Item>
                {/* <Form.Item
                    label="Username"
                    name="username"
                    rules={[{ required: true, message: "Please enter a username" }]}
                >
                    <Input />
                </Form.Item> */}
                <Form.Item
                label="Select Template"
                name="packageId"
                rules={[{ required: true, message: "Please select a template" }]}
                >
                <Select showSearch
                    placeholder="Select a Template"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }>
                    {packages.map((pkg) => (
                    <Option key={pkg.TemplateId} value={pkg.TemplateId}>
                        {pkg.TemplateName}
                    </Option>
                    ))}
                </Select>
                </Form.Item>
                <Form.Item
                    label="Upload Chat Files"
                    name="uploadFiles"
                    // valuePropName="fileList"
                    // getValueFromEvent={(e) => {
                    //     if (Array.isArray(e)) {
                    //         return e;
                    //     }
                    //     return e && e.fileList;
                    // }}
                    rules={[{ required: true, message: "Please upload files" }]}
                >
                    <Dragger 
                    name="file"
                    multiple={true}
                    accept={textTypes.join(',')}
                    action="" 
                    beforeUpload={(file) => {
                        const isTextDocument = file.type.startsWith('text/') ||
                        textTypes.includes(file.type);
                      if (!isTextDocument) {
                        message.error(`${file.name} is not a supported text document`);
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
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                            Support for a single or bulk upload. Strictly prohibit from uploading company data or other
                            band files
                        </p>
                    </Dragger>
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={disabled} disabled={disabled}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
            {/* a button to trigger auto fill forms and generate output */}
            <Button 
            hidden={!filesUploaded}
            className="m-4 w-1/4 self-center shadow-md"
            style={{backgroundColor: "#52c41a", color: "white"}}
            onClick={generateFilledForms}
            loading={disabled} disabled={disabled}
            >Generate Filled Forms</Button>

        </div>
    );
}