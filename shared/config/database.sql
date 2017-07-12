
/////new///////

CREATE DATABASE `Pomelo`
CHARACTER SET 'utf8'
COLLATE 'utf8_general_ci';

create table User
(
  userID INT UNSIGNED AUTO_INCREMENT NOT NULL,
  userName CHAR(12) NOT NULL,
  passWord CHAR(20) NOT NULL,
  userType INT8 UNSIGNED NOT NULL DEFAULT 0,
  parent CHAR(12) DEFAULT NULL,
  roomID INT UNSIGNED NOT NULL DEFAULT 0,
  phoneNumber CHAR(11) DEFAULT NULL,
  nick VARCHAR(24) DEFAULT NULL,
  lastLoginTime TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  loginCount INT UNSIGNED  NOT NULL DEFAULT 0,
  waitBalance INT  NOT NULL DEFAULT 0,
  balance INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (userID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


create table Room
(
  roomID INT UNSIGNED AUTO_INCREMENT NOT NULL,
  roomType INT8 UNSIGNED NOT NULL DEFAULT 0,
  parent INT UNSIGNED DEFAULT NULL,
  roomName VARCHAR(32) NOT NULL,
  roomDescrib VARCHAR(64) NOT NULL DEFAULT 'room',
  userName CHAR(12) DEFAULT NULL,
  config VARCHAR(512)  DEFAULT NULL,
  note  VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (roomID)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table Account
(
  id INT UNSIGNED AUTO_INCREMENT NOT NULL,
  userID INT UNSIGNED NOT NULL,
  time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  operation INT8 UNSIGNED NOT NULL DEFAULT 0,
  score INT UNSIGNED NOT NULL DEFAULT 0,
  target INT UNSIGNED NOT NULL,
  note VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


create table Transactions
(
  id INT UNSIGNED AUTO_INCREMENT NOT NULL,
  userID INT UNSIGNED NOT NULL,
  time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  operation INT UNSIGNED NOT NULL DEFAULT 0,
  debit INT UNSIGNED NOT NULL DEFAULT 0,
  credit INT UNSIGNED NOT NULL DEFAULT 0,
  target INT UNSIGNED NOT NULL,
  note VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table DayReport
(
  id INT UNSIGNED AUTO_INCREMENT NOT NULL,
  userID INT UNSIGNED NOT NULL,
  time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  operation INT UNSIGNED NOT NULL DEFAULT 0,
  debit INT UNSIGNED NOT NULL DEFAULT 0,
  credit INT UNSIGNED NOT NULL DEFAULT 0,
  target INT UNSIGNED NOT NULL,
  note VARCHAR(32) DEFAULT NULL,
  PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table MonthReport
(
  id INT UNSIGNED AUTO_INCREMENT NOT NULL,
  userID INT UNSIGNED NOT NULL,
  time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  operation INT UNSIGNED NOT NULL DEFAULT 0,
  debit INT UNSIGNED NOT NULL DEFAULT 0,
  credit INT UNSIGNED NOT NULL DEFAULT 0,
  target INT UNSIGNED NOT NULL,
  note VARCHAR(32) DEFAULT NULL,
  PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

create table YearReport
(
  id INT UNSIGNED AUTO_INCREMENT NOT NULL,
  userID INT UNSIGNED NOT NULL,
  time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  operation INT UNSIGNED NOT NULL DEFAULT 0,
  debit INT UNSIGNED NOT NULL DEFAULT 0,
  credit INT UNSIGNED NOT NULL DEFAULT 0,
  target INT UNSIGNED NOT NULL,
  note VARCHAR(32) DEFAULT NULL,
  PRIMARY KEY (id)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;


DELIMITER &&
           drop procedure if exists chargeToAccount &&
           create procedure chargeToAccount(IN pUserName CHAR(16), IN pOperation INT, IN pDebit INT,IN pCredit INT,IN pTargetName CHAR(16) )
               BEGIN
               declare affectedRows int;
               declare rows int;
               DECLARE result INT;
               declare tUserID INT;
               declare tTargetID INT;
               set result = 0;
               select userID into tUserID from User where userName = pUserName;
               select userID into tTargetID from User where userName = pTargetName;
                   insert into Transactions  (userID,operation, debit,credit,target,note) values (tUserID,pOperation,pDebit,pCredit,tTargetID,null);
                   update DayReport set debit= debit + pDebit,credit = credit + pCredit where userID = tUserID AND target = tTargetID AND DATE_FORMAT(time,'%y-%m-%d') = DATE_FORMAT(NOW(),'%y-%m-%d');
                   select row_count() into affectedRows;
                   if affectedRows = 0 then
                         insert into DayReport (userID,operation, debit,credit,target,note) values (tUserID,pOperation,pDebit,pCredit,tTargetID,null);
                    end if;

                    update MonthReport set debit= debit + pDebit,credit = credit + pCredit where userID = tUserID  AND target = tTargetID AND DATE_FORMAT(time,'%y-%m') = DATE_FORMAT(NOW(),'%y-%m');
                    select row_count() into affectedRows;
                    if affectedRows = 0 then
                          insert into MonthReport (userID,operation, debit,credit,target,note) values (tUserID,pOperation,pDebit,pCredit,tTargetID,null);
                     end if;

                 select result;
           END  &&
           DELIMITER ;

DELIMITER &&
drop procedure if exists betToAccount &&
create procedure betToAccount(IN pUserID INT, IN pOperation INT, IN pDebit INT,IN pCredit INT,IN pRoomID INT )
    BEGIN
    declare affectedRows int;
    DECLARE result INT;
    declare tUserID INT;
    declare tTargetID INT;
    set tTargetID = pRoomID;
    set result = 0;
    set tUserID = pUserID;

        insert into Transactions  (userID,operation, debit,credit,target,note) values (tUserID,pOperation,pDebit,pCredit,tTargetID,null);
        update DayReport set debit= debit + pDebit,credit = credit + pCredit where userID = tUserID AND target = tTargetID AND DATE_FORMAT(time,'%y-%m-%d') = DATE_FORMAT(NOW(),'%y-%m-%d');
        select row_count() into affectedRows;
        if affectedRows = 0 then
              insert into DayReport (userID,operation, debit,credit,target,note) values (tUserID,pOperation,pDebit,pCredit,tTargetID,null);
         end if;

         update MonthReport set debit= debit + pDebit,credit = credit + pCredit where userID = tUserID  AND target = tTargetID AND DATE_FORMAT(time,'%y-%m') = DATE_FORMAT(NOW(),'%y-%m');
         select row_count() into affectedRows;
         if affectedRows = 0 then
               insert into MonthReport (userID,operation, debit,credit,target,note) values (tUserID,pOperation,pDebit,pCredit,tTargetID,null);
          end if;
      select result;
END  &&
DELIMITER ;


//alter table User add unique userName(userName);
insert into User (userName,passWord,userType,nick) values ("Zhao","Zhao",88,"Zhao");

alter table Account add target CHAR(12) NOT NULL;



