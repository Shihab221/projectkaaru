import mongoose, { Schema, Document, Model } from "mongoose";

// Review interface
export interface IReview {
  user: mongoose.Types.ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

// Size interface
export interface IProductSize {
  name: string;
  price: number;
  discountedPrice?: number;
  stock?: number; // Optional, defaults to 1000
}

// Size schema
const productSizeSchema = new Schema<IProductSize>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, "Price cannot be negative"],
  },
  discountedPrice: {
    type: Number,
    min: [0, "Discounted price cannot be negative"],
  },
  stock: {
    type: Number,
    min: [0, "Stock cannot be negative"],
    default: 1000,
  },
});

// Product interface
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  discountedPrice?: number;
  category: mongoose.Types.ObjectId;
  subcategory?: string;
  images: string[];
  stock?: number; // Optional, defaults to 1000 if no sizes, or applies to single size
  sizes?: IProductSize[]; // Multiple sizes with individual prices/stocks
  backgroundColors?: string[]; // Array of hex colors for background
  borderColors?: string[]; // Array of hex colors for borders
  isTopProduct: boolean;
  isActive: boolean;
  reviews: IReview[];
  averageRating: number;
  numReviews: number;
  sold: number;
  createdAt: Date;
  updatedAt: Date;
}

// Review schema
const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Product schema
const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    shortDescription: {
      type: String,
      maxlength: [200, "Short description cannot exceed 200 characters"],
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountedPrice: {
      type: Number,
      min: [0, "Discounted price cannot be negative"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    images: [{}], // Can be string URLs (old format) or objects with data/contentType/filename (new format)
    stock: {
      type: Number,
      min: [0, "Stock cannot be negative"],
      default: 1000,
    },
    sizes: [productSizeSchema],
    backgroundColors: [{
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          // Validate hex color format
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Background color must be a valid hex color (e.g., #FF0000)'
      }
    }],
    borderColors: [{
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          // Validate hex color format
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Border color must be a valid hex color (e.g., #FF0000)'
      }
    }],
    isTopProduct: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from name before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  next();
});

// Calculate average rating after review update
productSchema.methods.calculateAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.numReviews = 0;
  } else {
    const sum = this.reviews.reduce((acc: number, review: IReview) => acc + review.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

// Indexes for better query performance
productSchema.index({ name: "text", description: "text" });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isTopProduct: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", productSchema);

export default Product;

