"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Select, DatePicker, Upload, message, Image } from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { upload } from "src/services/apiService/files/upload";
import { editProjectById } from "src/services/apiService/projects/editProjectById";
import { getProjectById } from "src/services/apiService/projects/getProjectById"; // Import the getProjectById function
import { FileTypeKeys } from "src/constants/payloadKeys/file";
import { EditProjectPayload } from "src/interfaces/payload/projectPayload";

type Props = {};

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

export default function FormBasic({}: Props) {
  const pathName = usePathname();
  const router = useRouter();
  const projectIdMatch = pathName.match(/\/create-project\/([a-zA-Z0-9]+)/);
  const projectId = projectIdMatch ? projectIdMatch[1] : "";

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<string>("");
  const [initialCarouselImageUrls, setInitialCarouselImageUrls] = useState<string[]>([]);

  // Fetch project data and set initial form values
  useEffect(() => {
    const fetchProjectData = async () => {
      if (projectId) {
        try {
          const projectData = await getProjectById(projectId);
          form.setFieldsValue({
            title: projectData.data?.name,
            description: projectData.data?.description,
            country: projectData.data?.address?.country,
            city: projectData.data?.address?.city,
            province: projectData.data?.address?.province,
            postalCode: projectData.data?.address?.postalCode,
            category: projectData.data?.category,
            // Add any other fields that need to be set
          });

          // Set the initial file list if there are carousel images
          if (projectData.data?.carouselImageUrls) {
            setInitialCarouselImageUrls(projectData.data?.carouselImageUrls);
            setFileList(
              projectData.data?.carouselImageUrls.map((url) => ({
                uid: url,
                name: url.split("/").pop(),
                status: "done",
                url,
              }))
            );
          }
        } catch (error) {
          message.error("Failed to load project data.");
          console.error(error);
        }
      }
    };

    fetchProjectData();
  }, [projectId, form]);

  const onFinish = async (values: any) => {
    console.log("Form values:", values);

    let carouselImageUrls: string[] = [...initialCarouselImageUrls];

    if (fileList.length > 0) {
      try {
        // Only upload files if they are new
        const newFiles = fileList.filter(file => !initialCarouselImageUrls.includes(file.url));
        if (newFiles.length > 0) {
          const payload = {
            file: newFiles.map((file) => file.originFileObj), 
            fileType: FileTypeKeys.CAROUSEL_IMAGE_FILES,
            projectId: projectId,
          };

          const response = await upload(payload);
          if (response && response.length > 0) {
            carouselImageUrls = [...carouselImageUrls, ...response.map((img) => img.url ?? "")]; // Append new image URLs
            message.success("Images uploaded successfully!");
          }
        }
      } catch (error) {
        message.error("Image upload failed!");
        console.error(error);
      }
    }

    const projectPayload: Partial<EditProjectPayload> = {
      name: values.title,
      carouselImageUrls: carouselImageUrls,
      description: values.description,
      address: {
        country: values.country,
        city: values.city,
        province: values.province,
        postalCode: values.postalCode,
      },
      status: 0, // Update according to your needs
      category: values.category,
    };

    try {
      await editProjectById(projectId, projectPayload);
      message.success("Project updated successfully!");
      router.push(`/create-project/${projectId}/story`);
    } catch (error) {
      message.error("Project update failed!");
    }
  };

  const handlePreview = async (file: any) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }: any) => setFileList(newFileList);

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div className="mt-2">Upload</div>
    </div>
  );

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        className="max-w-[460px]"
      >
        <h1 className="text-4xl mb-1">Basic Details</h1>
        <p className="mb-2">Summarize your details for a good impression</p>
        <Form.Item
          name="title"
          label="Project Title"
          rules={[{ required: true, message: "Please input your project title!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Project Description"
          rules={[{ required: true, message: "Please input your project description!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="image" label="Project Image">
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={() => false}
            onPreview={handlePreview}
            onChange={handleChange}
          >
            {fileList.length >= 8 ? null : uploadButton}
          </Upload>
          {previewImage && (
            <Image
              alt={previewImage}
              wrapperStyle={{ display: 'none' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )}
        </Form.Item>
        <Form.Item
          name="country"
          label="Country"
          rules={[{ required: true, message: "Please input the country!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="city"
          label="City"
          rules={[{ required: true, message: "Please input the city!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="province"
          label="Province"
          rules={[{ required: true, message: "Please input the province!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="postalCode"
          label="Postal Code"
          rules={[{ required: true, message: "Please input the postal code!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Please select a category!" }]}
        >
          <Select>
            <Select.Option value="technology">Technology</Select.Option>
            <Select.Option value="food">Food</Select.Option>
            <Select.Option value="art">Art</Select.Option>
            <Select.Option value="health">Health</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save & continue
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}