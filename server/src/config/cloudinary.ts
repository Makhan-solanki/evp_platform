import { v2 as cloudinary } from 'cloudinary';
import { logger } from './logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class CloudinaryService {
  /**
   * Upload file to Cloudinary
   */
  async uploadFile(
    filePath: string,
    options: {
      folder?: string;
      resource_type?: 'image' | 'video' | 'raw' | 'auto';
      format?: string;
      transformation?: Record<string, unknown>;
      public_id?: string;
    } = {}
  ): Promise<{
    url: string;
    secure_url: string;
    public_id: string;
    format: string;
    resource_type: string;
    bytes: number;
    width?: number;
    height?: number;
  }> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: options.folder || 'experience-verification',
        resource_type: options.resource_type || 'auto',
        format: options.format,
        transformation: options.transformation,
        public_id: options.public_id,
        use_filename: true,
        unique_filename: true,
      });

      logger.info('File uploaded to Cloudinary successfully', {
        public_id: result.public_id,
        url: result.secure_url,
      });

      return result;
    } catch (error) {
      logger.error('Failed to upload file to Cloudinary', { error, filePath });
      throw new Error('File upload failed');
    }
  }

  /**
   * Upload buffer to Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    options: {
      folder?: string;
      resource_type?: 'image' | 'video' | 'raw' | 'auto';
      format?: string;
      transformation?: Record<string, unknown>;
      public_id?: string;
    } = {}
  ): Promise<{
    url: string;
    secure_url: string;
    public_id: string;
    format: string;
    resource_type: string;
    bytes: number;
    width?: number;
    height?: number;
  }> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'experience-verification',
          resource_type: options.resource_type || 'auto',
          format: options.format,
          transformation: options.transformation,
          public_id: options.public_id,
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            logger.error('Failed to upload buffer to Cloudinary', { error });
            reject(new Error('Buffer upload failed'));
          } else if (result) {
            logger.info('Buffer uploaded to Cloudinary successfully', {
              public_id: result.public_id,
              url: result.secure_url,
            });
            resolve(result);
          } else {
            reject(new Error('Upload result is undefined'));
          }
        }
      ).end(buffer);
    });
  }

  /**
   * Delete file from Cloudinary
   */
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw' = 'image'
  ): Promise<{ result: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });

      logger.info('File deleted from Cloudinary successfully', {
        public_id: publicId,
        result: result.result,
      });

      return result;
    } catch (error) {
      logger.error('Failed to delete file from Cloudinary', { error, publicId });
      throw new Error('File deletion failed');
    }
  }

  /**
   * Generate optimized image URL
   */
  generateOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
      fetch_format?: string;
    } = {}
  ): string {
    try {
      const url = cloudinary.url(publicId, {
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        quality: options.quality || 'auto',
        format: options.format,
        fetch_format: options.fetch_format || 'auto',
        secure: true,
      });

      return url;
    } catch (error) {
      logger.error('Failed to generate optimized URL', { error, publicId });
      throw new Error('URL generation failed');
    }
  }

  /**
   * Generate thumbnail URL
   */
  generateThumbnailUrl(
    publicId: string,
    size: 'small' | 'medium' | 'large' = 'medium'
  ): string {
    const sizes = {
      small: { width: 150, height: 150 },
      medium: { width: 300, height: 300 },
      large: { width: 600, height: 600 },
    };

    return this.generateOptimizedUrl(publicId, {
      ...sizes[size],
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }

  /**
   * Get file info
   */
  async getFileInfo(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<{
    public_id: string;
    format: string;
    resource_type: string;
    bytes: number;
    width?: number;
    height?: number;
    created_at: string;
    url: string;
    secure_url: string;
  }> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });

      return result;
    } catch (error) {
      logger.error('Failed to get file info from Cloudinary', { error, publicId });
      throw new Error('Getting file info failed');
    }
  }

  /**
   * List files in folder
   */
  async listFiles(
    folder: string,
    options: {
      max_results?: number;
      next_cursor?: string;
      resource_type?: 'image' | 'video' | 'raw';
    } = {}
  ): Promise<{
    resources: Array<{
      public_id: string;
      format: string;
      resource_type: string;
      bytes: number;
      width?: number;
      height?: number;
      created_at: string;
      url: string;
      secure_url: string;
    }>;
    next_cursor?: string;
  }> {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: options.max_results || 100,
        next_cursor: options.next_cursor,
        resource_type: options.resource_type || 'image',
      });

      return result;
    } catch (error) {
      logger.error('Failed to list files from Cloudinary', { error, folder });
      throw new Error('Listing files failed');
    }
  }

  /**
   * Generate signed upload URL
   */
  generateSignedUploadUrl(options: {
    folder?: string;
    public_id?: string;
    eager?: string;
    timestamp?: number;
  } = {}): {
    url: string;
    signature: string;
    timestamp: number;
    api_key: string;
  } {
    try {
      const timestamp = options.timestamp || Math.round(new Date().getTime() / 1000);
      const params = {
        timestamp,
        folder: options.folder || 'experience-verification',
        public_id: options.public_id,
        eager: options.eager,
      };

      // Remove undefined values
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined)
      );

      const signature = cloudinary.utils.api_sign_request(
        cleanParams,
        process.env.CLOUDINARY_API_SECRET!
      );

      return {
        url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/upload`,
        signature,
        timestamp,
        api_key: process.env.CLOUDINARY_API_KEY!,
      };
    } catch (error) {
      logger.error('Failed to generate signed upload URL', { error });
      throw new Error('Signed URL generation failed');
    }
  }

  /**
   * Validate file type and size
   */
  validateFile(
    file: Express.Multer.File,
    options: {
      maxSize?: number; // in bytes
      allowedTypes?: string[];
      allowedExtensions?: string[];
    } = {}
  ): { valid: boolean; error?: string } {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
      allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
    } = options;

    // Check file size
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`,
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type ${file.mimetype} is not allowed`,
      };
    }

    // Check file extension
    const extension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `File extension ${extension} is not allowed`,
      };
    }

    return { valid: true };
  }
}

// Create singleton instance
const cloudinaryService = new CloudinaryService();

export { cloudinaryService };
export default cloudinaryService;
