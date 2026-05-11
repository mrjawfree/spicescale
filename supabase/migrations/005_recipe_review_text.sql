alter table recipe_ratings
  add column if not exists review_text varchar(500) default null;
