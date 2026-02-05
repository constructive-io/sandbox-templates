// **NOTE** This file contains mock schema data for testing purposes.
import { SchemaData } from '@/lib/schema';

// E-commerce Schema
const ecommerceSchema: SchemaData = {
	name: 'E-commerce Platform',
	description: 'Complete online store with orders, products, and merchants',
	category: 'Retail',
	nodes: [
		{
			id: 'users',
			type: 'tableNode',
			position: { x: 800, y: 150 },
			data: {
				label: 'users',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'full_name', type: 'varchar' },
					{ name: 'email', type: 'varchar' },
					{ name: 'gender', type: 'varchar' },
					{ name: 'date_of_birth', type: 'date' },
					{ name: 'country_code', type: 'varchar', isForeign: true },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'orders',
			type: 'tableNode',
			position: { x: 450, y: 183 },
			data: {
				label: 'orders',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'user_id', type: 'int', isForeign: true },
					{ name: 'status', type: 'varchar' },
					{ name: 'total_amount', type: 'decimal' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'order_items',
			type: 'tableNode',
			position: { x: 100, y: 150 },
			data: {
				label: 'order_items',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'order_id', type: 'int', isForeign: true },
					{ name: 'product_id', type: 'int', isForeign: true },
					{ name: 'quantity', type: 'int' },
					{ name: 'unit_price', type: 'decimal' },
				],
			},
		},
		{
			id: 'products',
			type: 'tableNode',
			position: { x: 100, y: 460 },
			data: {
				label: 'products',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'merchant_id', type: 'int', isForeign: true },
					{ name: 'name', type: 'varchar' },
					{ name: 'description', type: 'text' },
					{ name: 'price', type: 'decimal' },
					{ name: 'status', type: 'varchar' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'merchants',
			type: 'tableNode',
			position: { x: 450, y: 493 },
			data: {
				label: 'merchants',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'name', type: 'varchar' },
					{ name: 'email', type: 'varchar' },
					{ name: 'country_code', type: 'varchar', isForeign: true },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'countries',
			type: 'tableNode',
			position: { x: 800, y: 570 },
			data: {
				label: 'countries',
				fields: [
					{ name: 'code', type: 'varchar', isPrimary: true },
					{ name: 'name', type: 'varchar' },
					{ name: 'continent_name', type: 'varchar' },
					{ name: 'currency', type: 'varchar' },
				],
			},
		},
	],
	edges: [
		{
			id: 'users-orders',
			source: 'users',
			target: 'orders',
			sourceHandle: 'id',
			targetHandle: 'user_id',
			type: 'custom',
		},
		{
			id: 'orders-order_items',
			source: 'orders',
			target: 'order_items',
			sourceHandle: 'id',
			targetHandle: 'order_id',
			type: 'custom',
		},
		{
			id: 'products-order_items',
			source: 'products',
			target: 'order_items',
			sourceHandle: 'id',
			targetHandle: 'product_id',
			type: 'custom',
		},
		{
			id: 'merchants-products',
			source: 'merchants',
			target: 'products',
			sourceHandle: 'id',
			targetHandle: 'merchant_id',
			type: 'custom',
		},
		{
			id: 'countries-users',
			source: 'countries',
			target: 'users',
			sourceHandle: 'code',
			targetHandle: 'country_code',
			type: 'custom',
		},
		{
			id: 'countries-merchants',
			source: 'countries',
			target: 'merchants',
			sourceHandle: 'code',
			targetHandle: 'country_code',
			type: 'custom',
		},
	],
};

// Blog/CMS Schema
const blogSchema: SchemaData = {
	name: 'Blog & CMS',
	description: 'Content management system with posts, categories, and comments',
	category: 'Content',
	nodes: [
		{
			id: 'users',
			type: 'tableNode',
			position: { x: 400, y: 50 },
			data: {
				label: 'users',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'username', type: 'varchar' },
					{ name: 'email', type: 'varchar' },
					{ name: 'role', type: 'varchar' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'posts',
			type: 'tableNode',
			position: { x: 50, y: 300 },
			data: {
				label: 'posts',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'author_id', type: 'int', isForeign: true },
					{ name: 'title', type: 'varchar' },
					{ name: 'content', type: 'text' },
					{ name: 'status', type: 'varchar' },
					{ name: 'published_at', type: 'timestamp' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'categories',
			type: 'tableNode',
			position: { x: 750, y: 300 },
			data: {
				label: 'categories',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'name', type: 'varchar' },
					{ name: 'slug', type: 'varchar' },
					{ name: 'description', type: 'text' },
				],
			},
		},
		{
			id: 'post_categories',
			type: 'tableNode',
			position: { x: 400, y: 450 },
			data: {
				label: 'post_categories',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'post_id', type: 'int', isForeign: true },
					{ name: 'category_id', type: 'int', isForeign: true },
				],
			},
		},
		{
			id: 'comments',
			type: 'tableNode',
			position: { x: 50, y: 600 },
			data: {
				label: 'comments',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'post_id', type: 'int', isForeign: true },
					{ name: 'author_id', type: 'int', isForeign: true },
					{ name: 'content', type: 'text' },
					{ name: 'status', type: 'varchar' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
	],
	edges: [
		{
			id: 'users-posts',
			source: 'users',
			target: 'posts',
			sourceHandle: 'id',
			targetHandle: 'author_id',
			type: 'custom',
		},
		{
			id: 'posts-post_categories',
			source: 'posts',
			target: 'post_categories',
			sourceHandle: 'id',
			targetHandle: 'post_id',
			type: 'custom',
		},
		{
			id: 'categories-post_categories',
			source: 'categories',
			target: 'post_categories',
			sourceHandle: 'id',
			targetHandle: 'category_id',
			type: 'custom',
		},
		{
			id: 'posts-comments',
			source: 'posts',
			target: 'comments',
			sourceHandle: 'id',
			targetHandle: 'post_id',
			type: 'custom',
		},
		{
			id: 'users-comments',
			source: 'users',
			target: 'comments',
			sourceHandle: 'id',
			targetHandle: 'author_id',
			type: 'custom',
		},
	],
};

// Social Media Schema
const socialSchema: SchemaData = {
	name: 'Social Network',
	description: 'Social media platform with posts, followers, and interactions',
	category: 'Social',
	nodes: [
		{
			id: 'users',
			type: 'tableNode',
			position: { x: 400, y: 50 },
			data: {
				label: 'users',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'username', type: 'varchar' },
					{ name: 'email', type: 'varchar' },
					{ name: 'bio', type: 'text' },
					{ name: 'avatar_url', type: 'varchar' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'posts',
			type: 'tableNode',
			position: { x: 100, y: 350 },
			data: {
				label: 'posts',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'user_id', type: 'int', isForeign: true },
					{ name: 'content', type: 'text' },
					{ name: 'image_url', type: 'varchar' },
					{ name: 'likes_count', type: 'int' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'follows',
			type: 'tableNode',
			position: { x: 700, y: 250 },
			data: {
				label: 'follows',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'follower_id', type: 'int', isForeign: true },
					{ name: 'following_id', type: 'int', isForeign: true },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'likes',
			type: 'tableNode',
			position: { x: 400, y: 500 },
			data: {
				label: 'likes',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'user_id', type: 'int', isForeign: true },
					{ name: 'post_id', type: 'int', isForeign: true },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
	],
	edges: [
		{
			id: 'users-posts',
			source: 'users',
			target: 'posts',
			sourceHandle: 'id',
			targetHandle: 'user_id',
			type: 'custom',
		},
		{
			id: 'users-follows_follower',
			source: 'users',
			target: 'follows',
			sourceHandle: 'id',
			targetHandle: 'follower_id',
			type: 'custom',
		},
		{
			id: 'users-follows_following',
			source: 'users',
			target: 'follows',
			sourceHandle: 'id',
			targetHandle: 'following_id',
			type: 'custom',
		},
		{
			id: 'users-likes',
			source: 'users',
			target: 'likes',
			sourceHandle: 'id',
			targetHandle: 'user_id',
			type: 'custom',
		},
		{
			id: 'posts-likes',
			source: 'posts',
			target: 'likes',
			sourceHandle: 'id',
			targetHandle: 'post_id',
			type: 'custom',
		},
	],
};

// Financial/Banking Schema
const bankingSchema: SchemaData = {
	name: 'Banking System',
	description: 'Financial platform with accounts, transactions, and loans',
	category: 'Finance',
	nodes: [
		{
			id: 'customers',
			type: 'tableNode',
			position: { x: 400, y: 50 },
			data: {
				label: 'customers',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'first_name', type: 'varchar' },
					{ name: 'last_name', type: 'varchar' },
					{ name: 'ssn', type: 'varchar' },
					{ name: 'phone', type: 'varchar' },
					{ name: 'email', type: 'varchar' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'accounts',
			type: 'tableNode',
			position: { x: 100, y: 350 },
			data: {
				label: 'accounts',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'customer_id', type: 'int', isForeign: true },
					{ name: 'account_number', type: 'varchar' },
					{ name: 'account_type', type: 'varchar' },
					{ name: 'balance', type: 'decimal' },
					{ name: 'status', type: 'varchar' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'transactions',
			type: 'tableNode',
			position: { x: 400, y: 550 },
			data: {
				label: 'transactions',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'account_id', type: 'int', isForeign: true },
					{ name: 'amount', type: 'decimal' },
					{ name: 'type', type: 'varchar' },
					{ name: 'status', type: 'varchar' },
					{ name: 'description', type: 'text' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'loans',
			type: 'tableNode',
			position: { x: 700, y: 350 },
			data: {
				label: 'loans',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'customer_id', type: 'int', isForeign: true },
					{ name: 'loan_type', type: 'varchar' },
					{ name: 'principal_amount', type: 'decimal' },
					{ name: 'interest_rate', type: 'decimal' },
					{ name: 'status', type: 'varchar' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
	],
	edges: [
		{
			id: 'customers-accounts',
			source: 'customers',
			target: 'accounts',
			sourceHandle: 'id',
			targetHandle: 'customer_id',
			type: 'custom',
		},
		{
			id: 'accounts-transactions',
			source: 'accounts',
			target: 'transactions',
			sourceHandle: 'id',
			targetHandle: 'account_id',
			type: 'custom',
		},
		{
			id: 'customers-loans',
			source: 'customers',
			target: 'loans',
			sourceHandle: 'id',
			targetHandle: 'customer_id',
			type: 'custom',
		},
	],
};

// Healthcare Schema
const healthcareSchema: SchemaData = {
	name: 'Healthcare Management',
	description: 'Medical system with patients, doctors, and appointments',
	category: 'Healthcare',
	nodes: [
		{
			id: 'patients',
			type: 'tableNode',
			position: { x: 200, y: 50 },
			data: {
				label: 'patients',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'first_name', type: 'varchar' },
					{ name: 'last_name', type: 'varchar' },
					{ name: 'date_of_birth', type: 'date' },
					{ name: 'gender', type: 'varchar' },
					{ name: 'phone', type: 'varchar' },
					{ name: 'address', type: 'text' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'doctors',
			type: 'tableNode',
			position: { x: 600, y: 50 },
			data: {
				label: 'doctors',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'first_name', type: 'varchar' },
					{ name: 'last_name', type: 'varchar' },
					{ name: 'specialization', type: 'varchar' },
					{ name: 'license_number', type: 'varchar' },
					{ name: 'phone', type: 'varchar' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'appointments',
			type: 'tableNode',
			position: { x: 400, y: 350 },
			data: {
				label: 'appointments',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'patient_id', type: 'int', isForeign: true },
					{ name: 'doctor_id', type: 'int', isForeign: true },
					{ name: 'appointment_date', type: 'datetime' },
					{ name: 'status', type: 'varchar' },
					{ name: 'notes', type: 'text' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
		{
			id: 'prescriptions',
			type: 'tableNode',
			position: { x: 100, y: 600 },
			data: {
				label: 'prescriptions',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'appointment_id', type: 'int', isForeign: true },
					{ name: 'medication', type: 'varchar' },
					{ name: 'dosage', type: 'varchar' },
					{ name: 'instructions', type: 'text' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
	],
	edges: [
		{
			id: 'patients-appointments',
			source: 'patients',
			target: 'appointments',
			sourceHandle: 'id',
			targetHandle: 'patient_id',
			type: 'custom',
		},
		{
			id: 'doctors-appointments',
			source: 'doctors',
			target: 'appointments',
			sourceHandle: 'id',
			targetHandle: 'doctor_id',
			type: 'custom',
		},
		{
			id: 'appointments-prescriptions',
			source: 'appointments',
			target: 'prescriptions',
			sourceHandle: 'id',
			targetHandle: 'appointment_id',
			type: 'custom',
		},
	],
};

// Education Schema
const educationSchema: SchemaData = {
	name: 'Education Platform',
	description: 'Learning management system with courses, students, and enrollments',
	category: 'Education',
	nodes: [
		{
			id: 'students',
			type: 'tableNode',
			position: { x: 150, y: 50 },
			data: {
				label: 'students',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'student_id', type: 'varchar' },
					{ name: 'first_name', type: 'varchar' },
					{ name: 'last_name', type: 'varchar' },
					{ name: 'email', type: 'varchar' },
					{ name: 'date_of_birth', type: 'date' },
					{ name: 'enrollment_date', type: 'date' },
				],
			},
		},
		{
			id: 'instructors',
			type: 'tableNode',
			position: { x: 650, y: 50 },
			data: {
				label: 'instructors',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'first_name', type: 'varchar' },
					{ name: 'last_name', type: 'varchar' },
					{ name: 'email', type: 'varchar' },
					{ name: 'department', type: 'varchar' },
					{ name: 'hire_date', type: 'date' },
				],
			},
		},
		{
			id: 'courses',
			type: 'tableNode',
			position: { x: 400, y: 300 },
			data: {
				label: 'courses',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'course_code', type: 'varchar' },
					{ name: 'title', type: 'varchar' },
					{ name: 'description', type: 'text' },
					{ name: 'credits', type: 'int' },
					{ name: 'instructor_id', type: 'int', isForeign: true },
					{ name: 'semester', type: 'varchar' },
					{ name: 'year', type: 'int' },
				],
			},
		},
		{
			id: 'enrollments',
			type: 'tableNode',
			position: { x: 100, y: 500 },
			data: {
				label: 'enrollments',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'student_id', type: 'int', isForeign: true },
					{ name: 'course_id', type: 'int', isForeign: true },
					{ name: 'enrollment_date', type: 'date' },
					{ name: 'grade', type: 'varchar' },
					{ name: 'status', type: 'varchar' },
				],
			},
		},
		{
			id: 'assignments',
			type: 'tableNode',
			position: { x: 700, y: 500 },
			data: {
				label: 'assignments',
				fields: [
					{ name: 'id', type: 'int', isPrimary: true },
					{ name: 'course_id', type: 'int', isForeign: true },
					{ name: 'title', type: 'varchar' },
					{ name: 'description', type: 'text' },
					{ name: 'due_date', type: 'datetime' },
					{ name: 'max_points', type: 'int' },
					{ name: 'created_at', type: 'timestamp' },
				],
			},
		},
	],
	edges: [
		{
			id: 'instructors-courses',
			source: 'instructors',
			target: 'courses',
			sourceHandle: 'id',
			targetHandle: 'instructor_id',
			type: 'custom',
		},
		{
			id: 'students-enrollments',
			source: 'students',
			target: 'enrollments',
			sourceHandle: 'id',
			targetHandle: 'student_id',
			type: 'custom',
		},
		{
			id: 'courses-enrollments',
			source: 'courses',
			target: 'enrollments',
			sourceHandle: 'id',
			targetHandle: 'course_id',
			type: 'custom',
		},
		{
			id: 'courses-assignments',
			source: 'courses',
			target: 'assignments',
			sourceHandle: 'id',
			targetHandle: 'course_id',
			type: 'custom',
		},
	],
};

// Export all schemas
export const SCHEMAS = {
	ecommerce: ecommerceSchema,
	blog: blogSchema,
	social: socialSchema,
	banking: bankingSchema,
	healthcare: healthcareSchema,
	education: educationSchema,
} as const;

// Export schema categories
export const SCHEMA_CATEGORIES = ['All', 'Retail', 'Content', 'Social', 'Finance', 'Healthcare', 'Education'] as const;

// Export types
export type SchemaKey = keyof typeof SCHEMAS;
export type SchemaCategory = (typeof SCHEMA_CATEGORIES)[number];
