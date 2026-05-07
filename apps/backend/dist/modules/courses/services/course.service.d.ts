import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CreateCourseDto, UpdateCourseDto, CourseQueryDto } from '../dto/course.dto';
import { UsersService } from '../../users/users.service';
import { OrganizationsService } from '../../organizations/organizations.service';
export declare class CoursesService {
    private readonly courseRepository;
    private readonly usersService;
    private readonly organizationsService;
    private readonly logger;
    constructor(courseRepository: Repository<Course>, usersService: UsersService, organizationsService: OrganizationsService);
    findAll(query: CourseQueryDto): Promise<Course[]>;
    findOne(id: string): Promise<Course>;
    create(instructorId: string, dto: CreateCourseDto): Promise<Course>;
    update(id: string, userId: string, dto: UpdateCourseDto): Promise<Course>;
    delete(id: string, userId: string): Promise<void>;
    publish(id: string, userId: string): Promise<Course>;
    private canUserEditCourse;
    private canUserDeleteCourse;
}
