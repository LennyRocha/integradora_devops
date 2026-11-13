import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class MongoImage {
  @Prop({ required: true, trim: true })
  url!: string;

  @Prop({ required: true, trim: true })
  publicId!: string;
}

export const MongoImageSchema = SchemaFactory.createForClass(MongoImage);
