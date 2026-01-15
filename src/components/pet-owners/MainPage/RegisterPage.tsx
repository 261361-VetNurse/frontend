// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { FormField } from '@/components/pet-owners/shared/form/FormField';
// import { TextInput } from '@/components/pet-owners/shared/form/TextInput';
// import { SelectInput } from '@/components/pet-owners/shared/form/SelectInput';
// import { PrimaryButton } from '@/components/pet-owners/shared/form/PrimaryButton';
// import {
//   RegisterContainer,
//   RegisterCard,
//   Header,
//   Title,
//   Subtitle,
//   Form
// } from '@/styles/register.styled';

// interface FormData {
//   firstName: string;
//   lastName: string;
//   gender: string;
//   phone: string;
//   email: string;
// }

// export default function RegisterPage() {
//   const router = useRouter();

//   const [formData, setFormData] = useState<FormData>({
//     firstName: '',
//     lastName: '',
//     gender: '',
//     phone: '',
//     email: '',
//   });

//   const isFormComplete = formData.firstName.trim() && formData.lastName.trim() && formData.gender && formData.phone.trim() && formData.email.trim();
  
//   const [errors, setErrors] = useState<Partial<FormData>>({});

//   const genderOptions = [
//     { label: 'Male', value: 'male' },
//     { label: 'Female', value: 'female' },
//     { label: 'Other', value: 'other' },
//   ];

//   const handleInputChange =
//     (field: keyof FormData) =>
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       setFormData(prev => ({
//         ...prev,
//         [field]: e.target.value,
//       }));

//       if (errors[field]) {
//         setErrors(prev => ({ ...prev, [field]: undefined }));
//       }
//     };

//   const validateForm = (): boolean => {
//     const newErrors: Partial<FormData> = {};

//     if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
//     if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
//     if (!formData.gender) newErrors.gender = 'Please select gender';
//     if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email';
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     const isValid = validateForm();
//     if (!isValid) return;

//     console.log('Form submitted:', formData);
//     router.push('/pet-owners/home-page');
//   };

//   return (
//     <RegisterContainer>
//       <RegisterCard>
//         <Header>
//           <Title>Register</Title>
//           <Subtitle>Please fill the form</Subtitle>
//         </Header>

//         <Form onSubmit={handleSubmit}>
//           <FormField label="First Name" htmlFor="firstName" error={errors.firstName}>
//             <TextInput
//               id="firstName"
//               value={formData.firstName}
//               onChange={handleInputChange('firstName')}
//               placeholder="Enter your first name"
//               error={!!errors.firstName}
//             />
//           </FormField>

//           <FormField label="Last Name" htmlFor="lastName" error={errors.lastName}>
//             <TextInput
//               id="lastName"
//               value={formData.lastName}
//               onChange={handleInputChange('lastName')}
//               placeholder="Enter your last name"
//               error={!!errors.lastName}
//             />
//           </FormField>

//           <FormField label="Gender" htmlFor="gender" error={errors.gender}>
//             <SelectInput
//               id="gender"
//               value={formData.gender}
//               onChange={handleInputChange('gender')}
//               options={genderOptions}
//               placeholder="Select gender"
//               error={!!errors.gender}
//             />
//           </FormField>

//           <FormField label="Phone" htmlFor="phone" error={errors.phone}>
//             <TextInput
//               id="phone"
//               type="tel"
//               value={formData.phone}
//               onChange={handleInputChange('phone')}
//               placeholder="Enter your phone number"
//               error={!!errors.phone}
//             />
//           </FormField>

//           <FormField label="Email" htmlFor="email" error={errors.email}>
//             <TextInput
//               id="email"
//               type="email"
//               value={formData.email}
//               onChange={handleInputChange('email')}
//               placeholder="Enter your email"
//               error={!!errors.email}
//             />
//           </FormField>
//         </Form>
        
//         <PrimaryButton size="md" type="submit" disabled={!isFormComplete} onClick={handleSubmit}>
//           Register
//         </PrimaryButton>
//       </RegisterCard>
//     </RegisterContainer>
//   );
// }

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormField } from '@/components/pet-owners/shared/form/FormField';
import { TextInput } from '@/components/pet-owners/shared/form/TextInput';
import { SelectInput } from '@/components/pet-owners/shared/form/SelectInput';
import { PrimaryButton } from '@/components/pet-owners/shared/form/PrimaryButton';
import {
  RegisterContainer,
  RegisterCard,
  Header,
  Title,
  Subtitle,
  Form
} from '@/styles/register.styled';

interface FormData {
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  email: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // เพิ่ม Loading State

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    gender: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const genderOptions = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
  ];

  const isFormComplete = 
    formData.firstName.trim() && 
    formData.lastName.trim() && 
    formData.gender && 
    formData.phone.trim() && 
    formData.email.trim();

  const handleInputChange =
    (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Please select gender';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isLoading) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      // ดึง Base URL จาก Environment Variable เพื่อให้ชี้ไปที่ ngrok
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      const res = await fetch(`${apiBaseUrl}/api/auth/register`, { // ปรับ URL ตรงนี้
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender,
          phone: formData.phone,
          email: formData.email,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Registration failed");
      }

      router.push('/pet-owners/home-page');
    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Header>
          <Title>Register</Title>
          <Subtitle>Please fill the form</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          <FormField label="First Name" htmlFor="firstName" error={errors.firstName}>
            <TextInput
              id="firstName"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              placeholder="Enter your first name"
              error={!!errors.firstName}
            />
          </FormField>

          <FormField label="Last Name" htmlFor="lastName" error={errors.lastName}>
            <TextInput
              id="lastName"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              placeholder="Enter your last name"
              error={!!errors.lastName}
            />
          </FormField>

          <FormField label="Gender" htmlFor="gender" error={errors.gender}>
            <SelectInput
              id="gender"
              value={formData.gender}
              onChange={handleInputChange('gender')}
              options={genderOptions}
              placeholder="Select gender"
              error={!!errors.gender}
            />
          </FormField>

          <FormField label="Phone" htmlFor="phone" error={errors.phone}>
            <TextInput
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              placeholder="Enter your phone number"
              error={!!errors.phone}
            />
          </FormField>

          <FormField label="Email" htmlFor="email" error={errors.email}>
            <TextInput
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              placeholder="Enter your email"
              error={!!errors.email}
            />
          </FormField>

          {/* ย้ายปุ่มเข้ามาใน Form เพื่อให้รองรับการ Submit ปกติ */}
          <div style={{ marginTop: '24px' }}>
            <PrimaryButton 
              size="md" 
              type="submit" 
              disabled={!isFormComplete || isLoading}
            >
              {isLoading ? "Registering..." : "Register"}
            </PrimaryButton>
          </div>
        </Form>
      </RegisterCard>
    </RegisterContainer>
  );
}