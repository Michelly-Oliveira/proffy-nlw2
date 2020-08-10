import { Request, Response } from "express";

import db from "../database/connection";

import convertHourToMinutes from "../utils/convertHourToMinuntes";

interface ScheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController {
  async create(request: Request, response: Response) {
    const {
      name,
      avatar,
      whatsapp,
      bio,
      subject,
      cost,
      schedule,
    } = request.body;

    // Use transaction to make sure that if one call to the db fails, all others that were already made get deleted
    const trx = await db.transaction();

    try {
      const insertedUsersIds = await trx("users").insert({
        name,
        avatar,
        whatsapp,
        bio,
      });

      const user_id = insertedUsersIds[0];

      const insertedClassesIds = await trx("classes").insert({
        subject,
        cost,
        user_id,
      });

      const class_id = insertedClassesIds[0];

      // Save the hour in minutes
      const classSchedule = schedule.map((scheduleItem: ScheduleItem) => {
        return {
          class_id,
          week_day: scheduleItem.week_day,
          from: convertHourToMinutes(scheduleItem.from),
          to: convertHourToMinutes(scheduleItem.to),
        };
      });

      await trx("class_schedule").insert(classSchedule);

      // Make insertion on the db
      await trx.commit();

      return response.status(201).send();
    } catch (err) {
      // Unmake any change that was made to the db
      await trx.rollback();

      return response.status(400).json({
        error: "Unexpected error while creating new class",
      });
    }
  }

  async index(request: Request, response: Response) {
    const filters = request.query;

    const subject = filters.subject as string;
    const week_day = filters.week_day as string;
    const time = filters.time as string;

    if (!week_day || !subject || !time) {
      return response.status(400).json({
        error: "Missing filters to search classes",
      });
    }

    const timeInMinutes = convertHourToMinutes(time as string);

    const classes = await db("classes")
      .whereExists(function () {
        // Select all columns
        this.select("class_schedule.*")
          // Of the table class_schedule
          .from("class_schedule")
          // Where the class_id is equal to the id of a class from the table classes(class exists)
          .whereRaw("`class_schedule`.`class_id` = `classes`.`id`")
          // And where the week_day is the same as the one passed by the user
          .whereRaw("`class_schedule`.`week_day` = ??", [Number(week_day)])
          // And where the time selected is after or at the same time the user started to work (from <=)
          .whereRaw("`class_schedule`.`from` <= ??", [timeInMinutes])
          // And where the time selected is before the user stops to work (from >)
          .whereRaw("`class_schedule`.`to` > ??", [timeInMinutes]);
      })
      .where("classes.subject", "=", subject)
      .join("users", "classes.user_id", "=", "users.id")
      .select(["classes.*", "users.*"]);

    return response.json(classes);
  }
}
