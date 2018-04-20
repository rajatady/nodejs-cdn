import { Router } from 'express'
import { middleware as query } from 'querymen'
import { create, index, show, update, destroy } from './controller'
import {uploadMiddleware} from '../../services/digitalocean'

const router = new Router()

/**
 * @api {post} /images Create image
 * @apiName CreateImage
 * @apiGroup Image
 * @apiSuccess {Object} image Image's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Image not found.
 */
router.post('/',
  uploadMiddleware,
  create)

/**
 * @api {get} /images Retrieve images
 * @apiName RetrieveImages
 * @apiGroup Image
 * @apiUse listParams
 * @apiSuccess {Object[]} images List of images.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query(),
  index)

/**
 * @api {get} /images/:id Retrieve image
 * @apiName RetrieveImage
 * @apiGroup Image
 * @apiSuccess {Object} image Image's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Image not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /images/:id Update image
 * @apiName UpdateImage
 * @apiGroup Image
 * @apiSuccess {Object} image Image's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Image not found.
 */
router.put('/:id',
  update)

/**
 * @api {delete} /images/:id Delete image
 * @apiName DeleteImage
 * @apiGroup Image
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Image not found.
 */
router.delete('/:id',
  destroy)

export default router
