import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IsPositive } from 'class-validator';
import { TeacherEarning, TeacherEarningStatus } from '../entities/teacher-earning.entity';
import { PaymentTransaction, TransactionType } from '../entities/payment-transaction.entity';

@Injectable()
export class TeacherPayoutsService {
  private readonly logger = new Logger(TeacherPayoutsService.name);
  private readonly platformFeePercent = 15;

  constructor(
    @InjectRepository(TeacherEarning)
    private readonly earningRepository: Repository<TeacherEarning>,
    @InjectRepository(PaymentTransaction)
    private readonly transactionRepository: Repository<PaymentTransaction>,
  ) {}

  async getTeacherEarnings(teacherId: string, year?: number): Promise<TeacherEarning[]> {
    const query = this.earningRepository
      .createQueryBuilder('earning')
      .where('earning.teacherId = :teacherId', { teacherId });

    if (year) {
      query.andWhere('earning.year = :year', { year });
    }

    query.orderBy('earning.year', 'DESC').addOrderBy('earning.month', 'DESC');

    return query.getMany();
  }

  async calculateEarnings(teacherId: string, month: number, year: number, organizationId: string): Promise<TeacherEarning> {
    const transactions = await this.transactionRepository.find({
      where: {
        teacherId,
        organizationId,
        type: TransactionType.CLASS_PAYMENT,
      },
    });

    const filteredTransactions = transactions.filter((t) => {
      const txDate = new Date(t.createdAt);
      return txDate.getMonth() + 1 === month && txDate.getFullYear() === year;
    });

    const grossAmount = filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
    const platformFee = grossAmount * (this.platformFeePercent / 100);
    const netAmount = grossAmount - platformFee;

    let earning = await this.earningRepository.findOne({
      where: { teacherId, month, year },
    });

    if (earning) {
      earning.grossAmount = grossAmount;
      earning.platformFee = platformFee;
      earning.netAmount = netAmount;
    } else {
      earning = this.earningRepository.create({
        teacherId,
        month,
        year,
        grossAmount,
        platformFee,
        netAmount,
        status: TeacherEarningStatus.PENDING,
      });
    }

    return this.earningRepository.save(earning);
  }

  async markAsPaid(teacherId: string, month: number, year: number, performedBy: string): Promise<TeacherEarning> {
    const earning = await this.earningRepository.findOne({
      where: { teacherId, month, year },
    });

    if (!earning) {
      throw new NotFoundException(`Earnings not found for ${month}/${year}`);
    }

    earning.status = TeacherEarningStatus.PAID;
    earning.paidAt = new Date();

    const transaction = this.transactionRepository.create({
      organizationId: '',
      teacherId,
      type: TransactionType.PAYOUT,
      amount: earning.netAmount,
      metadata: {
        earningId: earning.id,
        month,
        year,
        performedBy,
      },
    });
    await this.transactionRepository.save(transaction);

    return this.earningRepository.save(earning);
  }

  async recordClassPayment(
    teacherId: string,
    organizationId: string,
    classId: string,
    amount: number,
  ): Promise<void> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const transaction = this.transactionRepository.create({
      teacherId,
      organizationId,
      type: TransactionType.CLASS_PAYMENT,
      amount,
      metadata: { classId },
    });

    await this.transactionRepository.save(transaction);
  }

  async getEarningsSummary(teacherId: string): Promise<{
    totalGross: number;
    totalNet: number;
    totalPending: number;
    totalPaid: number;
  }> {
    const earnings = await this.earningRepository.find({
      where: { teacherId },
    });

    return {
      totalGross: earnings.reduce((sum, e) => sum + Number(e.grossAmount), 0),
      totalNet: earnings.reduce((sum, e) => sum + Number(e.netAmount), 0),
      totalPending: earnings
        .filter((e) => e.status === TeacherEarningStatus.PENDING)
        .reduce((sum, e) => sum + Number(e.netAmount), 0),
      totalPaid: earnings
        .filter((e) => e.status === TeacherEarningStatus.PAID)
        .reduce((sum, e) => sum + Number(e.netAmount), 0),
    };
  }
}
