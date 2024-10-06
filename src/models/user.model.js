const { Schema, model, Types } = require('mongoose')
const slugify = require('slugify')

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'users'

const userSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            maxLength: 100,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
        },
        picturePath: {
            type: String,
            default: '',
        },

        location: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        gender: {
            type: String,
            enum: ['Nam', 'Nữ', 'Khác', null],
            default: null,
        },
        role: {
            type: String,
            required: true,
            enum: ['admin', 'user'],
            default: 'user',
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

userSchema.pre('validate', function (next) {
    const randomId = Math.floor(Math.random() * 90000)
    this.slug = slugify(`${this.name}.${randomId.toString()}`, { lower: true, locale: 'vi' })
    next()
})

module.exports = model(DOCUMENT_NAME, userSchema)
